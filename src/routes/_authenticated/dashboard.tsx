import { createFileRoute, Link } from "@tanstack/react-router";
import { Bot, Camera, FlaskConical, BookOpen, GraduationCap, Users, User } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — HAM PRO" }] }),
  component: Dashboard,
});

const TILES = [
  { to: "/tutor", icon: Bot, title: "AI Tutor", desc: "Ask anything, get clear step-by-step answers." },
  { to: "/identify", icon: Camera, title: "Identify & Notes", desc: "Photo → instant explanation and downloadable notes." },
  { to: "/syllabus", icon: BookOpen, title: "Syllabuses", desc: "Zambian (ECZ), Cambridge, IB, Common Core & more." },
  { to: "/tests", icon: GraduationCap, title: "Tests", desc: "Generate practice tests by subject and level." },
  { to: "/labs", icon: FlaskConical, title: "Interactive Labs", desc: "50+ science, math & computing simulations." },
  { to: "/community", icon: Users, title: "Study Groups", desc: "Chat live with classmates around the world." },
  { to: "/profile", icon: User, title: "My Profile", desc: "Picture, display name, education level." },
] as const;

function Dashboard() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="rounded-3xl p-8 md:p-10 text-white shadow-[var(--shadow-leaf)]" style={{ background: "var(--gradient-canopy)" }}>
        <h1 className="text-3xl md:text-4xl font-bold">Welcome back 🌱</h1>
        <p className="mt-2 opacity-90 max-w-xl">Pick a tool below to keep growing your knowledge.</p>
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