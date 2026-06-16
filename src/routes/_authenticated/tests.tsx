import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateTest } from "@/lib/identify.functions";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, GraduationCap, CheckCircle2, XCircle, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getOfflineQuestions } from "@/lib/offline-test-bank";

export const Route = createFileRoute("/_authenticated/tests")({
  head: () => ({ meta: [{ title: "Tests — HAM PRO" }] }),
  component: Tests,
});

type Q = { q: string; options: string[]; answer: number; explanation: string };

function Tests() {
  const [subject, setSubject] = useState("Mathematics");
  const [level, setLevel] = useState("Grade 8 (Zambian ECZ)");
  const [count, setCount] = useState(5);
  const [busy, setBusy] = useState(false);
  const [qs, setQs] = useState<Q[]>([]);
  const [picks, setPicks] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [online, setOnline] = useState<boolean>(() => (typeof navigator === "undefined" ? true : navigator.onLine));
  const [usedOffline, setUsedOffline] = useState(false);
  const gen = useServerFn(generateTest);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  function startOffline(reason?: string) {
    const c = Math.max(3, Math.min(30, Math.round(count)));
    const offline = getOfflineQuestions(subject, c);
    if (offline.length === 0) { toast.error("No offline questions for this subject"); return; }
    setQs(offline); setUsedOffline(true);
    if (reason) toast.message(reason);
  }

  async function start() {
    setBusy(true); setSubmitted(false); setPicks({}); setUsedOffline(false);
    const c = Math.max(3, Math.min(30, Math.round(count)));
    if (!online) { startOffline("You're offline — using built-in question bank."); setBusy(false); return; }
    try {
      const r = await gen({ data: { subject, level, count: c } });
      setQs(r.questions);
    } catch (e: any) {
      startOffline(`Couldn't reach AI — using offline questions. (${e?.message ?? "network error"})`);
    } finally { setBusy(false); }
  }

  const score = qs.reduce((n, q, i) => n + (picks[i] === q.answer ? 1 : 0), 0);

  async function submit() {
    setSubmitted(true);
    if (!online) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await supabase.from("test_attempts").insert({ user_id: user.id, subject, level, score, total: qs.length });
    } catch { /* offline / network — silent */ }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold flex items-center gap-2"><GraduationCap className="text-primary" /> Tests</h1>
      <p className="text-muted-foreground mt-1">Generate an instant practice test for any subject and level. Works offline too.</p>
      {!online && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm">
          <WifiOff className="size-4" /> You're offline — tests use the built-in question bank.
        </div>
      )}
      <div className="mt-6 grid sm:grid-cols-2 gap-3 rounded-2xl border bg-card p-5">
        <div><Label>Subject</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
        <div><Label>Level</Label><Input value={level} onChange={(e) => setLevel(e.target.value)} /></div>
        <div>
          <Label>Number of questions</Label>
          <Input type="number" min={3} max={30} value={count} onChange={(e) => setCount(Number(e.target.value) || 5)} />
        </div>
        <div className="flex items-end">
          <Button onClick={start} disabled={busy} className="w-full">
            {busy ? <><Loader2 className="size-4 animate-spin" /> Generating…</> : `Generate ${Math.max(3, Math.min(30, Math.round(count)))} questions`}
          </Button>
        </div>
        <Button variant="outline" onClick={() => startOffline()} disabled={busy} className="sm:col-span-2">
          Use offline question bank
        </Button>
      </div>
      {qs.length > 0 && (
        <div className="mt-6 space-y-4">
          {usedOffline && (
            <div className="text-xs text-muted-foreground">Showing offline questions from the built-in bank.</div>
          )}
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