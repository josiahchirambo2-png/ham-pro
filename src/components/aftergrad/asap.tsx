import { useState, useEffect, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Bot, ListPlus, Send, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { askAsap } from "@/lib/aftergrad/asap.functions";
import { nextSteps, type Workspace } from "@/lib/aftergrad/workspace";

type Message = { role: "user" | "assistant"; content: string };
const starters = {
  "Find Universities": "Ask me five questions, then help me find affordable universities and make a study plan.",
  "Find Scholarships": "Help me find scholarships suitable for my intended course and results.",
  "Check My Eligibility": "Help me check scholarship requirements and tell me what details you still need.",
  "Write My Essay": "Help me outline an honest, editable scholarship personal statement. Ask for one real example to start.",
};
export function Asap({ workspace, profileReady, prompt, onClose, addTasks }: { workspace: Workspace; profileReady: boolean; prompt: string; onClose: () => void; addTasks: () => void }) {
  const [text, setText] = useState(prompt);
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const ask = useServerFn(askAsap);
  useEffect(() => { if (prompt) setText(prompt); }, [prompt]);
  useEffect(() => { end.current?.scrollIntoView({ block: "nearest" }); }, [messages, busy]);
  async function send(text: string) {
    if (!text.trim() || busy) return;
    const batch: Message[] = [...messages, { role: "user", content: text.trim() }];
    setMessages(batch); setText(""); setBusy(true); setFailed(false);
    try {
      const p = workspace.profile;
      const { answer } = await ask({ data: { messages: batch.slice(-10).map((m) => ({ ...m, content: m.content.slice(0, 3200) })), saved: workspace.saved.slice(0, 40), profile: profileReady ? { points: p.points, budget: p.budgetZMW, course: (p.course || p.career).slice(0, 120), location: p.country.slice(0, 120) } : undefined } });
      if (!answer) throw new Error("Unavailable");
      setMessages([...batch, { role: "assistant", content: answer }]);
    } catch { setFailed(true); setMessages(messages); setText(text); }
    finally { setBusy(false); }
  }
  return <section aria-label="ASAP scholarship assistant" className="fixed inset-x-3 bottom-[4.75rem] z-40 ml-auto flex max-h-[calc(100dvh-6rem)] w-auto max-w-[28rem] flex-col overflow-hidden rounded-lg border border-border bg-popover shadow-lg sm:left-auto sm:right-6 sm:w-[28rem]">
    <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border p-3"><div className="flex items-center gap-2"><span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground"><Bot className="size-5" /></span><div><h2 className="font-semibold">ASAP</h2><p className="text-xs text-muted-foreground">Applying for Scholarship AI Program</p></div></div><Button size="icon" variant="ghost" aria-label="Close ASAP" onClick={onClose}><X /></Button></header>
    <div className="min-h-0 space-y-3 overflow-y-auto p-3" aria-live="polite"><p className="text-sm">Hi, I’m ASAP. What would you like to study?</p><div className="flex flex-wrap gap-1.5">{Object.entries(starters).map(([label, value]) => <Button key={label} size="sm" variant="outline" disabled={busy} onClick={() => void send(value)}>{label}</Button>)}</div>
    {messages.map((m, i) => <div key={i} className={`break-words rounded-md p-2.5 text-sm [&_li]:ml-5 [&_li]:list-disc [&_p+p]:mt-2 ${m.role === "user" ? "ml-5 bg-primary text-primary-foreground" : "mr-5 bg-muted"}`}><ReactMarkdown components={{ a: ({ children }) => <span>{children}</span> }}>{m.content}</ReactMarkdown></div>)}
    {busy && <p className="text-sm text-muted-foreground">ASAP is thinking…</p>}{failed && <p role="alert" className="text-sm text-muted-foreground">ASAP couldn’t reply. Try again online, or start with: {nextSteps[0].toLowerCase()}.</p>}<div ref={end} /></div>
    <div className="shrink-0 space-y-2 border-t border-border p-3"><Button size="sm" variant="ghost" onClick={addTasks}><ListPlus /> Add application checklist</Button><form className="flex items-end gap-2" onSubmit={(e) => { e.preventDefault(); void send(text); }}><Textarea rows={2} className="min-h-0 resize-none" aria-label="Message ASAP" placeholder="Ask ASAP…" value={text} maxLength={2000} onChange={(e) => setText(e.target.value)} /><Button type="submit" size="icon" aria-label="Send to ASAP" disabled={busy || !text.trim()}><Send /></Button></form><p className="text-[11px] leading-snug text-muted-foreground">ASAP provides guidance to help you make informed decisions. Always verify information and requirements on official university and scholarship websites before applying.</p></div>
  </section>;
}
