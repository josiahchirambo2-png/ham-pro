import { createServerFn } from "@tanstack/react-start";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { generateText } from "ai";
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

export const generateTest = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => TestInput.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGatewayProvider(key);
    const { text } = await generateText({
      model: gateway("google/gemini-2.5-flash"),
      prompt: `Generate ${data.count} multiple-choice questions for ${data.subject} at ${data.level} level. Return ONLY valid JSON of shape: {"questions":[{"q":"...","options":["A","B","C","D"],"answer":0,"explanation":"..."}]}. No markdown fences.`,
    });
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean) as { questions: { q: string; options: string[]; answer: number; explanation: string }[] };
    return parsed;
  });