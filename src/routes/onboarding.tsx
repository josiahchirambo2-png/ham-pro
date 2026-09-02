import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RoboMascot } from "@/components/robo-mascot";
import { LANGUAGES, setLanguage } from "@/lib/language";
import { setThemeFromLevel } from "@/components/theme-provider";
import { markOnboarded } from "@/lib/onboarding";
import { Check, ChevronLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Meet HAM — set up HAM PRO" },
      { name: "description", content: "Answer six quick questions so HAM can tailor lessons, labs and tests to your level, language and syllabus." },
      { property: "og:title", content: "Meet HAM — set up HAM PRO" },
      { property: "og:description", content: "Six quick questions to personalise your HAM PRO learning experience." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Onboarding,
});

type Answers = {
  age: string;
  language: string;
  syllabus: string;
  level: string;
  degree: string;
  referral: string;
};

const LEVELS = ["Primary school", "Secondary / High school", "College", "University"];
const SYLLABUSES = ["Zambian (ECZ)", "Cambridge / IGCSE", "International Baccalaureate", "British national curriculum", "American / Common Core", "Other"];
const REFERRALS = ["A friend or family member", "My school or teacher", "Social media", "Search engine", "App store", "Somewhere else"];

function Bubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative rounded-3xl border bg-card px-5 py-4 shadow-[var(--shadow-glass,0_10px_30px_-20px_rgba(0,0,0,.4))]">
      <span className="absolute -left-2 top-7 size-4 rotate-45 border-b border-l bg-card" />
      {children}
    </div>
  );
}

function Choice({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border-2 px-4 py-3.5 text-left text-sm font-medium transition active:translate-y-[2px] ${
        active ? "border-primary bg-primary/10 shadow-[0_4px_0_0_var(--primary)]" : "border-border hover:border-primary/60 hover:bg-accent shadow-[0_4px_0_0_var(--border)]"
      }`}
    >
      <span className="flex items-center justify-between gap-2">
        {label}
        {active && <Check className="size-4 text-primary" />}
      </span>
    </button>
  );
}

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [a, setA] = useState<Answers>({ age: "", language: "en", syllabus: "", level: "", degree: "", referral: "" });
  const [langQuery, setLangQuery] = useState("");

  const langs = useMemo(() => {
    const q = langQuery.trim().toLowerCase();
    return q ? LANGUAGES.filter((l) => l.label.toLowerCase().includes(q)) : LANGUAGES.slice(0, 12);
  }, [langQuery]);

  const steps = [
    { key: "intro", title: "Hi, I'm HAM!", sub: "I'm your tiny robot tutor. Six quick questions and I'll shape the app around you." },
    { key: "age", title: "How old are you?", sub: "This helps me pitch explanations just right." },
    { key: "language", title: "Which language do you prefer?", sub: "I speak Zambian, European and Asian languages." },
    { key: "syllabus", title: "Which syllabus do you follow?", sub: "Your tests and notes will match it." },
    { key: "level", title: "What level are you at?", sub: "Your labs, theme and mascots adapt to this." },
    { key: "degree", title: "What are you studying for?", sub: "A degree, a certificate, or just curiosity — all good." },
    { key: "referral", title: "How did you hear about HAM PRO?", sub: "Last one, promise." },
  ] as const;

  const current = steps[step];
  const progress = (step / (steps.length - 1)) * 100;

  const canContinue = (() => {
    switch (current.key) {
      case "age": return a.age.trim() !== "" && Number(a.age) > 0 && Number(a.age) < 120;
      case "language": return !!a.language;
      case "syllabus": return !!a.syllabus;
      case "level": return !!a.level;
      default: return true;
    }
  })();

  async function finish() {
    setSaving(true);
    const payload = {
      age: Number(a.age) || null,
      preferred_language: a.language,
      syllabus: a.syllabus,
      education_level: a.level,
      degree: a.degree.trim() || null,
      referral_source: a.referral || null,
      onboarded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from("profiles").update(payload as never).eq("id", user.id);
      if (error) toast.error(error.message);
    }
    setLanguage(a.language);
    setThemeFromLevel(a.level);
    markOnboarded(a);
    setSaving(false);
    toast.success("All set — welcome to HAM PRO");
    navigate({ to: "/dashboard", replace: true });
  }

  function next() {
    if (step === steps.length - 1) void finish();
    else setStep((s) => s + 1);
  }

  return (
    <div className="min-h-dvh flex flex-col px-4 py-6">
      <div className="mx-auto w-full max-w-xl flex items-center gap-3">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="text-muted-foreground disabled:opacity-30"
          aria-label="Back"
        >
          <ChevronLeft />
        </button>
        <div className="h-4 flex-1 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${Math.max(6, progress)}%` }} />
        </div>
        <button type="button" onClick={() => { markOnboarded(null); navigate({ to: "/dashboard", replace: true }); }} className="text-xs text-muted-foreground hover:text-foreground">
          Skip
        </button>
      </div>

      <div className="mx-auto w-full max-w-xl flex-1 flex flex-col justify-center gap-6 py-8">
        <div className="flex items-start gap-3">
          <div className="text-primary shrink-0"><RoboMascot size={84} talking={step === 0} /></div>
          <Bubble>
            <h1 className="text-xl font-bold">{current.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{current.sub}</p>
          </Bubble>
        </div>

        <div className="space-y-3">
          {current.key === "intro" && (
            <div className="rounded-2xl border bg-card p-5 text-sm space-y-2">
              <p className="flex items-center gap-2 font-medium"><Sparkles className="size-4 text-primary" /> What I'll personalise</p>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li>Lesson depth and wording for your age</li>
                <li>The language I answer in</li>
                <li>Tests and past papers for your syllabus</li>
                <li>Labs, theme and mascots for your level</li>
              </ul>
            </div>
          )}

          {current.key === "age" && (
            <div className="space-y-3">
              <Input
                type="number"
                min={3}
                max={110}
                inputMode="numeric"
                value={a.age}
                onChange={(e) => setA({ ...a, age: e.target.value })}
                placeholder="Your age"
                className="h-14 text-lg rounded-2xl"
              />
              <div className="flex flex-wrap gap-2">
                {[8, 12, 15, 18, 21, 25].map((n) => (
                  <button key={n} type="button" onClick={() => setA({ ...a, age: String(n) })}
                    className={`rounded-full border-2 px-4 py-1.5 text-sm ${a.age === String(n) ? "border-primary bg-primary/10" : "border-border hover:bg-accent"}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}

          {current.key === "language" && (
            <div className="space-y-3">
              <Input value={langQuery} onChange={(e) => setLangQuery(e.target.value)} placeholder="Search 60+ languages…" className="h-12 rounded-2xl" />
              <div className="grid sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                {langs.map((l) => (
                  <Choice key={l.code} label={l.label} active={a.language === l.code} onClick={() => setA({ ...a, language: l.code })} />
                ))}
              </div>
            </div>
          )}

          {current.key === "syllabus" && (
            <div className="grid sm:grid-cols-2 gap-2">
              {SYLLABUSES.map((s) => <Choice key={s} label={s} active={a.syllabus === s} onClick={() => setA({ ...a, syllabus: s })} />)}
            </div>
          )}

          {current.key === "level" && (
            <div className="grid sm:grid-cols-2 gap-2">
              {LEVELS.map((l) => <Choice key={l} label={l} active={a.level === l} onClick={() => setA({ ...a, level: l })} />)}
            </div>
          )}

          {current.key === "degree" && (
            <div className="space-y-3">
              <Input value={a.degree} onChange={(e) => setA({ ...a, degree: e.target.value })}
                placeholder="e.g. BSc Computer Science, Grade 10 sciences" className="h-14 text-lg rounded-2xl" />
              <p className="text-xs text-muted-foreground">Leave it blank if you're not studying for a specific qualification.</p>
            </div>
          )}

          {current.key === "referral" && (
            <div className="grid sm:grid-cols-2 gap-2">
              {REFERRALS.map((r) => <Choice key={r} label={r} active={a.referral === r} onClick={() => setA({ ...a, referral: r })} />)}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto w-full max-w-xl pb-2">
        <Button onClick={next} disabled={!canContinue || saving} className="w-full h-14 rounded-2xl text-base font-bold shadow-[0_4px_0_0_var(--border)]">
          {saving ? "Saving…" : step === steps.length - 1 ? "Start learning" : step === 0 ? "Let's go" : "Continue"}
        </Button>
      </div>
    </div>
  );
}
