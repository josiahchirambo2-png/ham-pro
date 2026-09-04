import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Clock, CalendarCheck, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/_app/_authenticated/progress")({
  head: () => ({ meta: [{ title: "Progress — KIT AI" }] }),
  component: ProgressPage,
});

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function ProgressPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
      const { data: s } = await supabase.from("study_sessions").select("*").gte("ended_at", weekAgo.toISOString()).order("ended_at", { ascending: false });
      setSessions(s ?? []);
      const { data: sc } = await (supabase as any).from("study_schedule").select("*");
      setSchedule(sc ?? []);
    })();
  }, []);

  const totalSeconds = sessions.reduce((a, s) => a + (s.seconds_spent || 0), 0);
  const hours = Math.floor(totalSeconds / 3600), mins = Math.floor((totalSeconds % 3600) / 60);
  const quizzes = sessions.filter((s) => s.quiz_total);
  const avgPct = quizzes.length ? Math.round(quizzes.reduce((a, s) => a + (s.quiz_score / s.quiz_total) * 100, 0) / quizzes.length) : 0;

  // Weekly per-day time (minutes)
  const perDay = Array.from({ length: 7 }, () => 0);
  sessions.forEach((s) => { const d = new Date(s.ended_at).getDay(); perDay[d] += (s.seconds_spent || 0) / 60; });
  const maxDay = Math.max(1, ...perDay);

  // Schedule completion: for each schedule slot, was there a session on that weekday?
  const doneByDay = new Set(sessions.map((s) => new Date(s.ended_at).getDay() + "|" + (s.subject || "").toLowerCase()));
  const totalSlots = schedule.length;
  const doneSlots = schedule.filter((s) => doneByDay.has(s.day_of_week + "|" + s.subject.toLowerCase())).length;
  const completionPct = totalSlots ? Math.round((doneSlots / totalSlots) * 100) : 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold flex items-center gap-2"><TrendingUp className="text-primary" /> Progress</h1>
      <p className="text-muted-foreground mt-1">Your last 7 days.</p>

      <div className="mt-6 grid sm:grid-cols-3 gap-3">
        <Stat icon={<Clock className="size-4" />} label="Study time" value={`${hours}h ${mins}m`} />
        <Stat icon={<CalendarCheck className="size-4" />} label="Schedule completion" value={`${completionPct}%`} sub={`${doneSlots}/${totalSlots} slots`} />
        <Stat icon={<GraduationCap className="size-4" />} label="Avg quiz" value={`${avgPct}%`} sub={`${quizzes.length} quizzes`} />
      </div>

      <div className="mt-6 rounded-2xl border bg-card p-5">
        <h2 className="font-semibold">This week</h2>
        <div className="mt-4 grid grid-cols-7 gap-2 items-end h-40">
          {perDay.map((mins, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="w-full rounded-t-md bg-primary/70" style={{ height: `${(mins / maxDay) * 100}%`, minHeight: mins > 0 ? 4 : 0 }} />
              <span className="text-[10px] text-muted-foreground">{DAYS[i]}</span>
              <span className="text-[10px] tabular-nums">{Math.round(mins)}m</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border bg-card p-5">
        <h2 className="font-semibold">Recent quiz scores</h2>
        <div className="mt-3 space-y-2">
          {quizzes.length === 0 && <p className="text-sm text-muted-foreground">No quizzes yet — start a study session to get quizzed.</p>}
          {quizzes.slice(0, 8).map((q) => (
            <div key={q.id} className="flex items-center justify-between text-sm border rounded-lg px-3 py-2">
              <span>{q.subject}</span>
              <span className="font-mono">{q.quiz_score}/{q.quiz_total}</span>
              <span className="text-xs text-muted-foreground">{new Date(q.ended_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">{icon} {label}</div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}