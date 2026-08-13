import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Bot, Camera, FlaskConical, GraduationCap, User, NotebookPen,
  Rocket, Sparkles, Users, CalendarDays, TrendingUp, Palette, Layers,
} from "lucide-react";
import { APPEARANCE_EVENT, getCourseId } from "@/lib/appearance";
import { courseById } from "@/lib/courses";
import { LevelDecor, LevelMascots, useLevelTier } from "@/components/level-decor";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — HAM PRO" }] }),
  component: Dashboard,
});

const TILES = [
  { to: "/courses", icon: Layers, title: "Courses", desc: "Pick a course and the whole app adapts to it." },
  { to: "/tutor", icon: Bot, title: "HAM — AI Tutor", desc: "Ask HAM anything, get clear step-by-step answers." },
  { to: "/identify", icon: Camera, title: "Identify & Notes", desc: "Photo → instant explanation and downloadable notes." },
  { to: "/notes", icon: NotebookPen, title: "My Notes", desc: "Saved notes you can search and use offline." },
  { to: "/tests", icon: GraduationCap, title: "Tests", desc: "Generate practice tests by subject and level." },
  { to: "/labs", icon: FlaskConical, title: "Interactive Labs", desc: "50+ science, math & computing simulations." },
  { to: "/hamiverse", icon: Rocket, title: "HAMIVERSE", desc: "Level-tuned labs, Galaxy Explorer and My Research." },
  { to: "/visualize", icon: Sparkles, title: "AI Visuals", desc: "Generate diagrams, mind maps and illustrations." },
  { to: "/community", icon: Users, title: "Study Groups", desc: "Public rooms plus password-protected private groups." },
  { to: "/schedule", icon: CalendarDays, title: "Schedule", desc: "Study timetable with reminders." },
  { to: "/progress", icon: TrendingUp, title: "Progress", desc: "Weekly study time and quiz scores." },
  { to: "/appearance", icon: Palette, title: "Scheme", desc: "Light, dark or match your device." },
  { to: "/profile", icon: User, title: "My Profile", desc: "Picture, display name, education level." },
] as const;

function Dashboard() {
  const tier = useLevelTier();
  const [courseId, setCourseId] = useState("general");
  useEffect(() => {
    const read = () => setCourseId(getCourseId());
    read();
    window.addEventListener(APPEARANCE_EVENT, read);
    return () => window.removeEventListener(APPEARANCE_EVENT, read);
  }, []);
  const course = courseById(courseId);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 p-8 md:p-12 text-white shadow-[var(--shadow-leaf)]" style={{ background: "var(--gradient-canopy)" }}>
        <LevelDecor tier={tier} />
        <div className="pointer-events-none absolute inset-0 az-grid-bg opacity-40" aria-hidden="true" />
        <div className="relative">
          <p className="az-eyebrow inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 opacity-90 backdrop-blur">
            <course.icon className="size-3.5" aria-hidden="true" /> {course.name}
          </p>
          <h1 className="az-display mt-4 text-4xl md:text-6xl leading-[1.05]">Welcome back</h1>
          <p className="mt-3 opacity-85 max-w-xl text-[15px] leading-relaxed">{course.greeting}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {course.subjects.map((s) => (
              <Link key={s} to="/study/$subject" params={{ subject: s }}
                className="rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[11px] uppercase tracking-[0.14em] backdrop-blur hover:bg-white/20 hover:border-white/50 transition">
                {s}
              </Link>
            ))}
          </div>
          <LevelMascots tier={tier} className="mt-6 md:hidden" />
        </div>
      </div>
      <div className="mt-10 flex items-center justify-between gap-4">
        <h2 className="az-display text-sm text-muted-foreground">Your path</h2>
        <span className="hidden sm:block h-px flex-1 bg-border" aria-hidden="true" />
        <span className="az-eyebrow inline-flex items-center gap-2 text-muted-foreground"><span className="az-dot" aria-hidden="true" /> Live</span>
      </div>
      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TILES.map((t, i) => (
          <Link key={t.to} to={t.to} className="group az-panel az-panel-hover overflow-hidden p-6">
            <span className="az-eyebrow text-muted-foreground/70">{String(i + 1).padStart(2, "0")}</span>
            <div className="mt-3 size-11 rounded-xl flex items-center justify-center text-primary-foreground az-glow-ring" style={{ background: "var(--gradient-leaf)" }}>
              <t.icon className="size-5" />
            </div>
            <h3 className="az-display mt-5 text-[15px]">{t.title}</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{t.desc}</p>
            <div className="az-meter mt-5"><span style={{ width: `${35 + ((i * 13) % 60)}%` }} /></div>
          </Link>
        ))}
      </div>
    </div>
  );
}