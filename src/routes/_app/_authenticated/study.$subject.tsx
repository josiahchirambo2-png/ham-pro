import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Timer, Play, Pause, RotateCcw, GraduationCap } from "lucide-react";
import { generateStudyQuiz, type Quiz } from "@/lib/quiz.functions";
import { detectTier, TIER_LABEL } from "@/lib/level";

export const Route = createFileRoute("/_app/_authenticated/study/$subject")({
  head: () => ({ meta: [{ title: "Study session — HAM PRO" }] }),
  validateSearch: z.object({ minutes: z.coerce.number().min(1).max(240).default(25) }),
  component: StudyPage,
});

function StudyPage() {
  const { subject } = Route.useParams();
  const { minutes } = Route.useSearch();
  const navigate = useNavigate();
  const total = minutes * 60;
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<"study" | "quiz" | "done">("study");
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [level, setLevel] = useState("secondary");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("education_level").eq("id", user.id).maybeSingle();
      if (data?.education_level) setLevel(TIER_LABEL[detectTier(data.education_level)].toLowerCase());
    })();
  }, []);

  useEffect(() => {
    if (!running || phase !== "study") return;
    const t = setInterval(() => setSeconds((s) => Math.min(total, s + 1)), 1000);
    return () => clearInterval(t);
  }, [running, phase, total]);

  useEffect(() => { if (phase === "study" && seconds >= total) startQuiz(); }, [seconds, phase, total]);

  async function startQuiz() {
    setRunning(false);
    setPhase("quiz");
    setLoadingQuiz(true);
    try {
      const q = await generateStudyQuiz({ data: { subject, level } });
      setQuiz(q);
    } catch (e: any) {
      toast.error(e.message || "Could not load quiz");
    } finally { setLoadingQuiz(false); }
  }

  async function submitQuiz() {
    if (!quiz) return;
    let score = 0;
    quiz.questions.forEach((q, i) => { if (answers[i] === q.answerIndex) score++; });
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await (supabase as any).from("study_sessions").insert({
        user_id: user.id, subject, seconds_spent: seconds, quiz_score: score, quiz_total: quiz.questions.length,
      });
    }
    setPhase("done");
    toast.success(`Session saved — scored ${score}/${quiz.questions.length}`);
  }

  const mm = String(Math.floor((total - seconds) / 60)).padStart(2, "0");
  const ss = String((total - seconds) % 60).padStart(2, "0");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-bold flex items-center gap-2"><Timer className="text-primary" /> Studying: {subject}</h1>
      <p className="text-muted-foreground text-sm mt-1">Set for {minutes} minutes — a quiz will follow.</p>

      {phase === "study" && (
        <div className="mt-8 rounded-2xl border bg-card p-8 text-center">
          <div className="text-6xl font-mono font-bold tabular-nums">{mm}:{ss}</div>
          <Progress value={(seconds / total) * 100} className="mt-6" />
          <div className="mt-6 flex justify-center gap-2">
            <Button size="lg" onClick={() => setRunning((r) => !r)}>
              {running ? <><Pause className="size-4" /> Pause</> : <><Play className="size-4" /> Start</>}
            </Button>
            <Button size="lg" variant="outline" onClick={() => { setSeconds(0); setRunning(false); }}><RotateCcw className="size-4" /> Reset</Button>
            <Button size="lg" variant="secondary" onClick={startQuiz}><GraduationCap className="size-4" /> Skip to quiz</Button>
          </div>
        </div>
      )}

      {phase === "quiz" && (
        <div className="mt-8 space-y-4">
          {loadingQuiz && <p className="text-sm text-muted-foreground">HAM is preparing your quiz…</p>}
          {quiz && quiz.questions.map((q, i) => (
            <div key={i} className="rounded-xl border bg-card p-4">
              <p className="font-medium">{i + 1}. {q.question}</p>
              <div className="mt-2 grid gap-2">
                {q.choices.map((c, idx) => (
                  <button key={idx} onClick={() => setAnswers((a) => ({ ...a, [i]: idx }))}
                    className={`text-left px-3 py-2 rounded-lg border text-sm ${answers[i] === idx ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent/50"}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {quiz && <Button className="w-full" size="lg" onClick={submitQuiz} disabled={Object.keys(answers).length < quiz.questions.length}>Submit quiz</Button>}
        </div>
      )}

      {phase === "done" && quiz && (
        <div className="mt-8 rounded-2xl border bg-card p-6 space-y-4">
          <h2 className="text-2xl font-bold">Nice work</h2>
          {quiz.questions.map((q, i) => {
            const correct = answers[i] === q.answerIndex;
            return (
              <div key={i} className={`p-3 rounded-lg border ${correct ? "border-green-500/40 bg-green-500/5" : "border-red-500/40 bg-red-500/5"}`}>
                <p className="font-medium text-sm">{q.question}</p>
                <p className="text-xs mt-1">Correct: <b>{q.choices[q.answerIndex]}</b></p>
                <p className="text-xs text-muted-foreground mt-1">{q.explanation}</p>
              </div>
            );
          })}
          <Button className="w-full" onClick={() => navigate({ to: "/schedule" })}>Back to schedule</Button>
        </div>
      )}
    </div>
  );
}