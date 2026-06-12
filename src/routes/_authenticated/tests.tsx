import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateTest } from "@/lib/identify.functions";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, GraduationCap, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/tests")({
  head: () => ({ meta: [{ title: "Tests — HAM PRO" }] }),
  component: Tests,
});

type Q = { q: string; options: string[]; answer: number; explanation: string };

function Tests() {
  const [subject, setSubject] = useState("Mathematics");
  const [level, setLevel] = useState("Grade 8 (Zambian ECZ)");
  const [busy, setBusy] = useState(false);
  const [qs, setQs] = useState<Q[]>([]);
  const [picks, setPicks] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const gen = useServerFn(generateTest);

  async function start() {
    setBusy(true); setSubmitted(false); setPicks({});
    try {
      const r = await gen({ data: { subject, level, count: 5 } });
      setQs(r.questions);
    } catch (e: any) { toast.error(e?.message ?? "Failed"); } finally { setBusy(false); }
  }

  const score = qs.reduce((n, q, i) => n + (picks[i] === q.answer ? 1 : 0), 0);

  async function submit() {
    setSubmitted(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from("test_attempts").insert({ user_id: user.id, subject, level, score, total: qs.length });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold flex items-center gap-2"><GraduationCap className="text-primary" /> Tests</h1>
      <p className="text-muted-foreground mt-1">Generate an instant practice test for any subject and level.</p>
      <div className="mt-6 grid sm:grid-cols-2 gap-3 rounded-2xl border bg-card p-5">
        <div><Label>Subject</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
        <div><Label>Level</Label><Input value={level} onChange={(e) => setLevel(e.target.value)} /></div>
        <Button onClick={start} disabled={busy} className="sm:col-span-2">
          {busy ? <><Loader2 className="size-4 animate-spin" /> Generating…</> : "Generate 5 questions"}
        </Button>
      </div>
      {qs.length > 0 && (
        <div className="mt-6 space-y-4">
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