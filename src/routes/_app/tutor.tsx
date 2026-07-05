import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Bot, User, Mic, MicOff, Volume2, VolumeX, Settings2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/tutor")({
  head: () => ({ meta: [{ title: "AI Tutor — HAM PRO" }] }),
  component: Tutor,
});

const VOICE_PREF_KEY = "hampro_voice_pref_v1";
type VoicePref = { enabled: boolean; rate: number; gender: "female" | "male" };
const DEFAULT_PREF: VoicePref = { enabled: false, rate: 1, gender: "female" };

function cleanForSpeech(s: string) {
  return s
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#*_>`~]+/g, " ")
    .replace(/\$+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pickVoice(voices: SpeechSynthesisVoice[], gender: "male" | "female") {
  const en = voices.filter((v) => v.lang?.toLowerCase().startsWith("en"));
  const pool = en.length ? en : voices;
  const femaleHints = ["female", "samantha", "victoria", "karen", "moira", "tessa", "google uk english female", "google us english", "zira", "susan", "fiona", "amelie"];
  const maleHints = ["male", "daniel", "alex", "fred", "tom", "google uk english male", "david", "mark", "oliver"];
  const hints = gender === "female" ? femaleHints : maleHints;
  const match = pool.find((v) => hints.some((h) => v.name.toLowerCase().includes(h)));
  return match ?? pool[0] ?? voices[0];
}

function Tutor() {
  const [input, setInput] = useState("");
  const [pref, setPref] = useState<VoicePref>(() => {
    if (typeof window === "undefined") return DEFAULT_PREF;
    try { return { ...DEFAULT_PREF, ...JSON.parse(localStorage.getItem(VOICE_PREF_KEY) || "{}") }; }
    catch { return DEFAULT_PREF; }
  });
  const [listening, setListening] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const recognitionRef = useRef<any>(null);
  const spokenIdsRef = useRef<Set<string>>(new Set());

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, status]);
  const busy = status === "submitted" || status === "streaming";

  // Persist preferences
  useEffect(() => { try { localStorage.setItem(VOICE_PREF_KEY, JSON.stringify(pref)); } catch {} }, [pref]);

  // Load TTS voices
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  // Speak completed assistant messages once
  useEffect(() => {
    if (!pref.enabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (status === "streaming" || status === "submitted") return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant") return;
    if (spokenIdsRef.current.has(last.id)) return;
    const text = cleanForSpeech(last.parts.map((p) => (p.type === "text" ? p.text : "")).join(""));
    if (!text) return;
    spokenIdsRef.current.add(last.id);
    const u = new SpeechSynthesisUtterance(text);
    u.rate = pref.rate;
    u.pitch = 1;
    const v = pickVoice(voices, pref.gender);
    if (v) u.voice = v;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }, [messages, status, pref, voices]);

  function stopSpeaking() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  }

  function startVoice() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.error("Voice input isn't supported in this browser"); return; }
    const rec = new SR();
    rec.lang = "en-US"; rec.interimResults = true; rec.continuous = false;
    let final = "";
    rec.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t; else interim += t;
      }
      setInput((final + interim).trim());
    };
    rec.onerror = () => { setListening(false); };
    rec.onend = () => {
      setListening(false);
      const text = (final || input).trim();
      if (!text) return;
      const cmd = text.toLowerCase().replace(/[.!?,]+$/g, "").trim();
      // Voice commands take priority over chat input
      if (/^(ham\s+)?(stop|be quiet|quiet|silence)$/.test(cmd)) { stopSpeaking(); setInput(""); return; }
      if (/^(ham\s+)?(mute|mute yourself)$/.test(cmd)) { stopSpeaking(); setPref((p) => ({ ...p, enabled: false })); setInput(""); return; }
      if (/^(ham\s+)?(unmute|speak|talk)$/.test(cmd)) { setPref((p) => ({ ...p, enabled: true })); setInput(""); return; }
      if (/^(ham\s+)?(clear|clear chat|reset)$/.test(cmd)) { spokenIdsRef.current = new Set(); setInput(""); window.location.reload(); return; }
      if (/^(ham\s+)?(faster|speed up)$/.test(cmd)) { setPref((p) => ({ ...p, rate: Math.min(2, p.rate + 0.25) })); setInput(""); return; }
      if (/^(ham\s+)?(slower|slow down)$/.test(cmd)) { setPref((p) => ({ ...p, rate: Math.max(0.5, p.rate - 0.25) })); setInput(""); return; }
      if (/^(ham\s+)?(male voice|use male voice)$/.test(cmd)) { setPref((p) => ({ ...p, gender: "male" })); setInput(""); return; }
      if (/^(ham\s+)?(female voice|use female voice)$/.test(cmd)) { setPref((p) => ({ ...p, gender: "female" })); setInput(""); return; }
      if (/^(send|submit|go)$/.test(cmd)) {
        const pending = input.trim(); if (pending) { sendMessage({ text: pending }); setInput(""); }
        return;
      }
      sendMessage({ text }); setInput("");
    };
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  }

  function stopVoice() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  function submitText() {
    if (!input.trim() || busy) return;
    sendMessage({ text: input.trim() });
    setInput("");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 flex flex-col" style={{ minHeight: "calc(100dvh - 56px - 60px)" }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Bot className="text-primary" /> HAM — Your AI Tutor</h1>
          <p className="text-sm text-muted-foreground">Ask anything from grade 1 to university. Voice commands: "send", "stop", "mute", "faster", "slower", "male voice", "female voice".</p>
        </div>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" onClick={() => { stopSpeaking(); setPref((p) => ({ ...p, enabled: !p.enabled })); }} title={pref.enabled ? "Mute HAM" : "Let HAM speak"}>
            {pref.enabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </Button>
          <Popover>
            <PopoverTrigger asChild><Button size="icon" variant="ghost"><Settings2 className="size-4" /></Button></PopoverTrigger>
            <PopoverContent className="w-72 space-y-4">
              <div>
                <Label className="text-xs">Voice gender</Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(["female", "male"] as const).map((g) => (
                    <Button key={g} size="sm" variant={pref.gender === g ? "default" : "outline"} onClick={() => setPref((p) => ({ ...p, gender: g }))}>
                      {g === "female" ? "Female" : "Male"}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Speech speed</Label>
                  <span className="text-xs font-mono text-muted-foreground">{pref.rate.toFixed(2)}×</span>
                </div>
                <Slider className="mt-2" min={0.5} max={2} step={0.05} value={[pref.rate]} onValueChange={(v) => setPref((p) => ({ ...p, rate: v[0] }))} />
              </div>
              <p className="text-[11px] text-muted-foreground">Voices are provided by your device. Available options vary by browser/OS.</p>
            </PopoverContent>
          </Popover>
        </div>
      </div>
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
        {(status === "submitted" || status === "streaming") && (
          <div className="flex items-center gap-3">
            <div className="ham-orb">
              <div className="ring r1" />
              <div className="ring r2" />
              <div className="ring r3" />
              <div className="core" />
              <div className="spark s1" />
              <div className="spark s2" />
              <div className="spark s3" />
            </div>
            <div className="px-3 py-2 rounded-2xl bg-muted/60">
              <span className="text-xs font-medium ham-think-text">HAM is thinking…</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <form
        onSubmit={(e) => { e.preventDefault(); submitText(); }}
        className="mt-4 flex gap-2 sticky bottom-2 bg-background/95 backdrop-blur p-2 rounded-2xl border"
      >
        <Button type="button" size="icon" variant={listening ? "destructive" : "ghost"} onClick={listening ? stopVoice : startVoice} title={listening ? "Stop listening" : "Speak to HAM"}>
          {listening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
        </Button>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={listening ? "Listening…" : "Ask HAM, or tap the mic to speak…"}
          rows={1}
          className="resize-none border-0 focus-visible:ring-0"
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitText(); } }}
        />
        <Button type="submit" size="icon" disabled={busy || !input.trim()}><Send className="size-4" /></Button>
      </form>
    </div>
  );
}