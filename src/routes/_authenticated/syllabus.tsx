import { createFileRoute } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";

export const Route = createFileRoute("/_authenticated/syllabus")({
  head: () => ({ meta: [{ title: "Syllabuses — HAM PRO" }] }),
  component: Syllabus,
});

const SYLLABUSES = [
  { name: "Zambian (ECZ)", featured: true, levels: ["Primary Grades 1–7", "Junior Secondary 8–9", "Senior Secondary 10–12"], subjects: ["English", "Mathematics", "Integrated Science", "Social Studies", "Civic Education", "Religious Education", "Zambian Languages", "Computer Studies", "Physics", "Chemistry", "Biology", "Geography", "History"] },
  { name: "Cambridge (IGCSE / A-Level)", levels: ["IGCSE", "AS Level", "A Level"], subjects: ["Mathematics", "Physics", "Chemistry", "Biology", "Economics", "Computer Science", "English Language", "Literature"] },
  { name: "International Baccalaureate (IB)", levels: ["PYP", "MYP", "DP"], subjects: ["Group 1–6 subjects", "TOK", "Extended Essay"] },
  { name: "Common Core (US)", levels: ["Elementary", "Middle", "High School"], subjects: ["ELA", "Math", "Science", "Social Studies"] },
  { name: "UK National Curriculum", levels: ["KS1–KS4", "GCSE"], subjects: ["English", "Maths", "Science", "History", "Geography"] },
  { name: "University / Tertiary", levels: ["Year 1–4", "Postgraduate"], subjects: ["Engineering", "Medicine", "Computer Science", "Business", "Education", "Law"] },
];

function Syllabus() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold flex items-center gap-2"><BookOpen className="text-primary" /> Syllabus library</h1>
      <p className="text-muted-foreground mt-1">Browse curriculums supported across HAM PRO — featuring the Zambian (ECZ) syllabus.</p>
      <div className="mt-6 grid md:grid-cols-2 gap-5">
        {SYLLABUSES.map((s) => (
          <div key={s.name} className={`rounded-2xl border p-6 bg-card ${s.featured ? "ring-2 ring-primary shadow-[var(--shadow-leaf)]" : ""}`}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{s.name}</h2>
              {s.featured && <span className="text-xs rounded-full bg-primary text-primary-foreground px-2 py-0.5">Featured</span>}
            </div>
            <div className="mt-3">
              <p className="text-xs font-medium uppercase text-muted-foreground">Levels</p>
              <div className="mt-1 flex flex-wrap gap-1.5">{s.levels.map((l) => <span key={l} className="text-xs rounded-full bg-secondary px-2.5 py-1">{l}</span>)}</div>
            </div>
            <div className="mt-3">
              <p className="text-xs font-medium uppercase text-muted-foreground">Subjects</p>
              <div className="mt-1 flex flex-wrap gap-1.5">{s.subjects.map((sub) => <span key={sub} className="text-xs rounded-md border px-2 py-0.5">{sub}</span>)}</div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Open the AI Tutor or Tests page to study any topic from this syllabus.</p>
          </div>
        ))}
      </div>
    </div>
  );
}