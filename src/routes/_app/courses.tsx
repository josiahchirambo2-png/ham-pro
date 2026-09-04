import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Layers } from "lucide-react";
import { COURSES, courseById } from "@/lib/courses";
import { APPEARANCE_EVENT, getCourseId, saveCourse } from "@/lib/appearance";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/courses")({
  head: () => ({
    meta: [
      { title: "Courses — KIT AI" },
      { name: "description", content: "Choose a course and KIT AI re-skins itself: colours, subjects and study tools tuned to what you're studying." },
      { property: "og:title", content: "Courses — KIT AI" },
      { property: "og:description", content: "Choose a course and KIT AI re-skins itself around what you're studying." },
    ],
  }),
  component: Courses,
});

function Courses() {
  const [selected, setSelected] = useState("general");
  useEffect(() => {
    const read = () => setSelected(getCourseId());
    read();
    window.addEventListener(APPEARANCE_EVENT, read);
    return () => window.removeEventListener(APPEARANCE_EVENT, read);
  }, []);

  function pick(id: string) {
    saveCourse(id);
    toast.success(`${courseById(id).name} selected — the app now matches your course`);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="rounded-3xl p-8 text-white shadow-[var(--shadow-leaf)] flex flex-wrap items-center justify-between gap-6" style={{ background: "var(--gradient-canopy)" }}>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Layers /> Courses</h1>
          <p className="mt-2 opacity-90 max-w-xl">
            Pick what you're studying. KIT AI changes its colours, home screen and subject shortcuts to match your course.
          </p>
        </div>
      </div>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {COURSES.map((c) => {
          const active = c.id === selected;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => pick(c.id)}
              className={`text-left rounded-2xl border bg-card p-6 transition hover:shadow-[var(--shadow-leaf)] ${active ? "border-primary ring-2 ring-primary/40" : "border-border"}`}
            >
              <div className="flex items-start justify-between">
                <span className="size-11 rounded-xl flex items-center justify-center text-primary-foreground" style={{ background: "var(--gradient-leaf)" }}>
                  <c.icon className="size-5" aria-hidden="true" />
                </span>
                {active && <Check className="size-5 text-primary" />}
              </div>
              <h2 className="mt-3 font-semibold">{c.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">{c.tagline}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {c.subjects.map((s) => (
                  <span key={s} className="rounded-full bg-secondary text-secondary-foreground px-2 py-0.5 text-[11px]">{s}</span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild><Link to="/dashboard">See my course home</Link></Button>
        <Button asChild variant="outline"><Link to="/appearance">Change colour scheme</Link></Button>
      </div>
    </div>
  );
}