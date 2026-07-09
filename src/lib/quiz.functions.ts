import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { generateText, Output, NoObjectGeneratedError } from "ai";

const Input = z.object({ subject: z.string().min(1), level: z.string().default("secondary") });
const QuestionSchema = z.object({
  question: z.string(),
  choices: z.array(z.string()).length(4),
  answerIndex: z.number().int().min(0).max(3),
  explanation: z.string(),
});
const QuizSchema = z.object({ questions: z.array(QuestionSchema).length(5) });

export type Quiz = z.infer<typeof QuizSchema>;

export const generateStudyQuiz = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => Input.parse(raw))
  .handler(async ({ data }): Promise<Quiz> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGatewayProvider(key);
    const prompt = `Create a 5-question multiple-choice quiz on the subject "${data.subject}" pitched at ${data.level} level. Each question must have exactly 4 choices with one correct answer. Include a one-sentence explanation. Do not use the "$" character anywhere.`;
    try {
      const { output } = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        output: Output.object({ schema: QuizSchema }),
        prompt,
      });
      return output;
    } catch (err) {
      if (NoObjectGeneratedError.isInstance(err)) {
        throw new Error("Could not generate a quiz right now — please try again.");
      }
      throw err;
    }
  });