import { createServerFn } from "@tanstack/react-start";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";

const Input = z.object({ imageDataUrl: z.string().min(20), syllabus: z.string().optional() });

export const identifyImage = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGatewayProvider(key);
    const { text } = await generateText({
      model: gateway("google/gemini-2.5-flash"),
      messages: [
        {
          role: "system",
          content: `You are HAM PRO, an educational vision assistant created by Josiah Brian Chirambo. Identify what is in the image, then produce clean downloadable study notes in markdown.`,
        },
        {
          role: "user",
          content: [
            { type: "text", text: `Identify this and produce study notes${data.syllabus ? ` aligned with the ${data.syllabus} syllabus` : ""}. Return markdown with:\n# Title\n**One-line summary**\n## What is it?\n## Key facts (bullets)\n## How it works / structure\n## In the ${data.syllabus ?? "school"} syllabus\n## Sample exam questions (3)\n## Further reading` },
            { type: "image", image: data.imageDataUrl },
          ],
        },
      ],
    });
    const titleMatch = text.match(/^#\s*(.+)$/m);
    return { title: titleMatch?.[1]?.trim() ?? "Identified item", notes: text };
  });

const TestInput = z.object({ subject: z.string().min(1), level: z.string().min(1), count: z.number().min(3).max(30).default(5) });

const TestQuestion = z.object({
  q: z.string(),
  options: z.array(z.string()),
  answer: z.number().int(),
  explanation: z.string(),
});
const TestSchema = z.object({ questions: z.array(TestQuestion) });

export const generateTest = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => TestInput.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGatewayProvider(key);
    const prompt = `Generate exactly ${data.count} multiple-choice questions for ${data.subject} at ${data.level} level. Each question has exactly 4 options, one correct, and a one-sentence explanation. "answer" is the zero-based index of the correct option. Never use the "$" character.`;

    // Primary path: schema-enforced generation.
    try {
      const { output } = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        output: Output.object({ schema: TestSchema }),
        prompt,
      });
      return normalizeTest(output, data.count);
    } catch (err) {
      // Fallback path: hand-written JSON extraction, kept so the Tests tab
      // still works if the model returns loose text instead of a schema.
      if (!NoObjectGeneratedError.isInstance(err)) throw err;
      const raw = NoObjectGeneratedError.isInstance(err) ? err.text ?? "" : "";
      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");
      if (start === -1 || end === -1) throw new Error("Could not generate a test right now — please try again.");
      const parsed = TestSchema.safeParse(JSON.parse(raw.slice(start, end + 1)));
      if (!parsed.success) throw new Error("Could not generate a test right now — please try again.");
      return normalizeTest(parsed.data, data.count);
    }
  });

// Small hand-written guard: models sometimes return 3 options or an out of
// range answer index. We repair instead of failing the whole test.
function normalizeTest(t: z.infer<typeof TestSchema>, count: number) {
  const questions = t.questions
    .filter((q) => q.options.length >= 2)
    .slice(0, count)
    .map((q) => ({
      q: q.q,
      options: q.options.slice(0, 4),
      answer: Math.min(Math.max(q.answer, 0), Math.min(q.options.length, 4) - 1),
      explanation: q.explanation,
    }));
  if (questions.length === 0) throw new Error("Could not generate a test right now — please try again.");
  return { questions };
}