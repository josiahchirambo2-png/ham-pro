import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

export const Route = createFileRoute("/_authenticated/tutor")({
  head: () => ({ meta: [{ title: "AI Tutor — HAM PRO" }] }),
  component: Tutor,
});

function Tutor() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, status]);
  const busy = status === "submitted" || status === "streaming";

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 flex flex-col" style={{ minHeight: "calc(100dvh - 56px - 60px)" }}>
      <h1 className="text-2xl font-bold flex items-center gap-2"><Bot className="text-primary" /> HAM — Your AI Tutor</h1>
      <p className="text-sm text-muted-foreground">HAM, created by Josiah Brian Chirambo · Ask anything from grade 1 to university.</p>
      <div className="flex-1 mt-4 space-y-4 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <div className="text-sm text-muted-foreground border border-dashed rounded-xl p-6 text-center">
            Try: "Explain photosynthesis for Grade 8 (Zambian syllabus)" or "Help me solve 2x + 5 = 17".
          </div>
        )}
        {messages.map((m) => {
          const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
          const isUser = m.role === "user";
          return (
            <div key={m.id} className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
              <div className="size-8 rounded-full flex items-center justify-center shrink-0" style={{ background: isUser ? "oklch(0.94 0.04 130)" : "var(--gradient-leaf)" }}>
                {isUser ? <User className="size-4 text-foreground" /> : <Bot className="size-4 text-white" />}
              </div>
              <div className={`max-w-[85%] ${isUser ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2" : ""}`}>
                {isUser ? <p className="whitespace-pre-wrap">{text}</p> : (
                  <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0">
                    <ReactMarkdown>{text}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {status === "submitted" && <p className="text-sm text-muted-foreground">Thinking…</p>}
        <div ref={endRef} />
      </div>
      <form
        onSubmit={(e) => { e.preventDefault(); if (input.trim() && !busy) { sendMessage({ text: input.trim() }); setInput(""); } }}
        className="mt-4 flex gap-2 sticky bottom-2 bg-background/95 backdrop-blur p-2 rounded-2xl border"
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the AI tutor…"
          rows={1}
          className="resize-none border-0 focus-visible:ring-0"
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (input.trim() && !busy) { sendMessage({ text: input.trim() }); setInput(""); } } }}
        />
        <Button type="submit" size="icon" disabled={busy || !input.trim()}><Send className="size-4" /></Button>
      </form>
    </div>
  );
}