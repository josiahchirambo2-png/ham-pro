/* ---------------------------------------------------------------------------
 * TESTS MODULE  ·  hand-written by Josiah Brian Chirambo
 * Two engines live in this file:
 *   1. instantTest()  - AI generated practice paper (falls back to the local
 *                       bank whenever the network or the model is unavailable)
 *   2. openPaper()    - ECZ past papers, typed out by hand, zero latency
 * Everything below is plain React state. No form library, no query cache.
 * ------------------------------------------------------------------------- */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateTest } from "@/lib/identify.functions";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, GraduationCap, CheckCircle2, XCircle, WifiOff, FileText, Terminal, Zap } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getOfflineQuestions } from "@/lib/offline-test-bank";
import { ECZ_PAPERS, type EczPaper } from "@/lib/ecz-past-papers";

export const Route = createFileRoute("/_app/tests")({
  head: () => ({
    meta: [
      { title: "Tests and ECZ Past Papers — HAM PRO" },
      { name: "description", content: "Generate an instant practice test on any subject, or open real ECZ past papers and answer them question by question." },
      { property: "og:title", content: "Tests and ECZ Past Papers — HAM PRO" },
      { property: "og:description", content: "Instant AI practice tests plus hand-typed ECZ past papers, online or offline." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Tests,
});

type Q = { q: string; options: string[]; answer: number; explanation: string };

/* A tiny source-stamp strip. It exists so the app wears its craft openly:
   these parts were typed by hand, not scaffolded. */
function SourceStamp({ file, note }: { file: string; note: string }) {
  return (
    <div className="mt-4 flex items-start gap-2 rounded-lg border border-dashed bg-muted/40 px-3 py-2 font-mono text-[11px] leading-relaxed text-muted-foreground">
      <Terminal className="mt-0.5 size-3.5 shrink-0" />
      <span>
        <span className="text-foreground">{file}</span> — {note}
      </span>
    </div>
  );
}

function Tests() {
  const [tab, setTab] = useState("practice");

  // ---- practice engine state -------------------------------------------
  const [subject, setSubject] = useState("Mathematics");
  const [level, setLevel] = useState("Grade 8 (Zambian ECZ)");
  const [count, setCount] = useState(5);
  const [busy, setBusy] = useState(false);
  const [qs, setQs] = useState<Q[]>([]);
  const [picks, setPicks] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [source, setSource] = useState<string>("");
  const [online, setOnline] = useState<boolean>(() => (typeof navigator === "undefined" ? true : navigator.onLine));
  const gen = useServerFn(generateTest);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  function loadQuestions(list: Q[], label: string) {
    setQs(list); setPicks({}); setSubmitted(false); setSource(label);
  }

  function startOffline(reason?: string) {
    const c = clamp(count);
    const offline = getOfflineQuestions(subject, c);
    if (offline.length === 0) { toast.error("No offline questions for this subject yet — try Mathematics, Science or English."); return; }
    loadQuestions(offline, "built-in question bank");
    if (reason) toast.message(reason);
  }

  async function instantTest() {
    setBusy(true);
    const c = clamp(count);
    if (!online) { startOffline("You are offline — using the built-in question bank."); setBusy(false); return; }
    try {
      const r = await gen({ data: { subject, level, count: c } });
      if (!r?.questions?.length) throw new Error("empty response");
      loadQuestions(r.questions, `HAM generated · ${subject} · ${level}`);
    } catch (e: any) {
      startOffline(`HAM could not be reached — switched to offline questions. (${e?.message ?? "network error"})`);
    } finally { setBusy(false); }
  }

  function openPaper(p: EczPaper) {
    loadQuestions(p.questions, `ECZ ${p.subject} ${p.level} ${p.year} ${p.paper}`);
    setSubject(p.subject);
    setLevel(`${p.level} (Zambian ECZ)`);
    setTab("practice");
    toast.success(`Opened ECZ ${p.subject} ${p.year}`);
  }

  const score = qs.reduce((n, q, i) => n + (picks[i] === q.answer ? 1 : 0), 0);

  async function submit() {
    setSubmitted(true);
    if (!online) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await supabase.from("test_attempts").insert({ user_id: user.id, subject, level, score, total: qs.length });
    } catch { /* offline or signed out — scoring still works locally */ }
  }

  const papersBySubject = useMemo(() => {
    const map = new Map<string, EczPaper[]>();
    for (const p of ECZ_PAPERS) map.set(p.subject, [...(map.get(p.subject) ?? []), p]);
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold flex items-center gap-2"><GraduationCap className="text-primary" /> Tests</h1>
      <p className="text-muted-foreground mt-1">Generate a practice test in one tap, or sit a real ECZ past paper.</p>

      {!online && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm">
          <WifiOff className="size-4" /> You are offline — tests fall back to the built-in bank and past papers still open.
        </div>
      )}

      <Tabs value={tab} onValueChange={setTab} className="mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="practice"><Zap className="size-4 mr-1" /> Practice test</TabsTrigger>
          <TabsTrigger value="ecz"><FileText className="size-4 mr-1" /> ECZ past papers</TabsTrigger>
        </TabsList>

        {/* -------------------- PRACTICE -------------------- */}
        <TabsContent value="practice" className="mt-4">
          <div className="rounded-2xl border bg-card p-5">
            <Button onClick={instantTest} disabled={busy} size="lg" className="w-full">
              {busy ? <><Loader2 className="size-4 animate-spin" /> Building your test…</> : <>Generate a test instantly</>}
            </Button>
            <div className="mt-4 grid sm:grid-cols-3 gap-3">
              <div><Label>Subject</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
              <div><Label>Level</Label><Input value={level} onChange={(e) => setLevel(e.target.value)} /></div>
              <div><Label>Questions</Label><Input type="number" min={3} max={30} value={count} onChange={(e) => setCount(Number(e.target.value) || 5)} /></div>
            </div>
            <Button variant="outline" onClick={() => startOffline()} disabled={busy} className="mt-3 w-full">
              Use the offline question bank
            </Button>
            <SourceStamp file="tests.tsx · instantTest()" note="hand-written fallback chain: AI first, local bank second, never a blank screen." />
          </div>
        </TabsContent>

        {/* -------------------- ECZ PAST PAPERS -------------------- */}
        <TabsContent value="ecz" className="mt-4 space-y-5">
          {papersBySubject.map(([subj, papers]) => (
            <div key={subj} className="rounded-2xl border bg-card p-5">
              <h2 className="font-semibold">{subj}</h2>
              <div className="mt-3 grid sm:grid-cols-2 gap-2">
                {papers.map((p) => (
                  <button key={p.id} onClick={() => openPaper(p)}
                    className="text-left rounded-xl border px-4 py-3 transition hover:border-primary hover:bg-accent/40">
                    <div className="font-medium text-sm">{p.level} · {p.year}</div>
                    <div className="text-xs text-muted-foreground">{p.paper} · {p.questions.length} questions</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
          <SourceStamp file="ecz-past-papers.ts" note="past papers typed out by hand by Josiah Brian Chirambo — no fetch, no AI, instant offline." />
        </TabsContent>
      </Tabs>

      {qs.length > 0 && (
        <div className="mt-6 space-y-4">
          {source && <div className="text-xs text-muted-foreground">Source: {source}</div>}
          {qs.map((q, i) => (
            <div key={i} className="rounded-xl border bg-card p-5">
              <p className="font-medium">{i + 1}. {q.q}</p>
              <div className="mt-3 grid gap-2">
                {q.options.map((o, oi) => {
                  const picked = picks[i] === oi;
                  const correct = submitted && oi === q.answer;
                  const wrong = submitted && picked && oi !== q.answer;
                  return (
                    <button key={oi} disabled={submitted}
                      onClick={() => setPicks((p) => ({ ...p, [i]: oi }))}
                      className={`text-left rounded-lg border px-3 py-2 text-sm flex items-center gap-2 ${picked ? "border-primary bg-accent/40" : ""} ${correct ? "border-green-600 bg-green-100 dark:bg-green-900/30" : ""} ${wrong ? "border-destructive bg-destructive/10" : ""}`}>
                      {correct && <CheckCircle2 className="size-4 text-green-700" />}
                      {wrong && <XCircle className="size-4 text-destructive" />}
                      {o}
                    </button>
                  );
                })}
              </div>
              {submitted && <p className="mt-2 text-xs text-muted-foreground">{q.explanation}</p>}
            </div>
          ))}
          {!submitted ? (
            <Button onClick={submit} disabled={Object.keys(picks).length < qs.length} className="w-full">Submit answers</Button>
          ) : (
            <div className="rounded-xl bg-primary text-primary-foreground p-5 text-center font-semibold">Score: {score} / {qs.length}</div>
          )}
        </div>
      )}
    </div>
  );
}

// clamp the requested question count into a sane range
function clamp(n: number) { return Math.max(3, Math.min(30, Math.round(n || 5))); }
