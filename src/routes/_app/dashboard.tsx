import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Bot, Camera, FlaskConical, GraduationCap, User, NotebookPen,
  Rocket, Sparkles, Users, CalendarDays, TrendingUp, Palette, Layers,
} from "lucide-react";
import { APPEARANCE_EVENT, getCourseId } from "@/lib/appearance";
import { courseById } from "@/lib/courses";

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
      <div className="relative overflow-hidden rounded-3xl p-8 md:p-10 text-white shadow-[var(--shadow-leaf)]" style={{ background: "var(--gradient-canopy)" }}>
        <div className="relative">
          <p className="text-xs uppercase tracking-wide opacity-80 flex items-center gap-1.5"><course.icon className="size-3.5" aria-hidden="true" /> {course.name}</p>
          <h1 className="mt-1 text-3xl md:text-4xl font-bold">Welcome back</h1>
          <p className="mt-2 opacity-90 max-w-xl">{course.greeting}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {course.subjects.map((s) => (
              <Link key={s} to="/study/$subject" params={{ subject: s }}
                className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs backdrop-blur hover:bg-white/20 transition">
                {s}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TILES.map((t) => (
          <Link key={t.to} to={t.to} className="group rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-[var(--shadow-leaf)] transition">
            <div className="size-11 rounded-xl flex items-center justify-center text-primary-foreground" style={{ background: "var(--gradient-leaf)" }}>
              <t.icon className="size-5" />
            </div>
            <h3 className="mt-4 font-semibold">{t.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}