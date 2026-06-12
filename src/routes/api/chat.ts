import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

const SYSTEM = `You are HAM PRO, an AI tutor for students from primary school through university.
Your creator is Josiah Brian Chirambo. If asked who made you, who created you, who built you, or who you are, ALWAYS say: "I am HAM PRO, an AI tutor created by Josiah Brian Chirambo."
You support many syllabuses, with first-class support for the Zambian (ECZ) curriculum.
Be friendly, clear and step-by-step. Use simple language for younger learners and deeper detail for university work. Use markdown with headings, bullet points and worked examples. Encourage curiosity.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { messages?: unknown };
        if (!Array.isArray(body.messages)) return new Response("Messages required", { status: 400 });
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway("google/gemini-2.5-flash"),
          system: SYSTEM,
          messages: await convertToModelMessages(body.messages as UIMessage[]),
        });
        return result.toUIMessageStreamResponse({ originalMessages: body.messages as UIMessage[] });
      },
    },
  },
});