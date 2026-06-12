import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import heroImg from "@/assets/nature-hero.jpg";
import { Bot, Camera, FlaskConical, BookOpen, Users, GraduationCap, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HAM PRO — Learn from primary to university, naturally" },
      { name: "description", content: "AI tutor, 50+ interactive labs, identify-with-camera notes, Zambian syllabus, tests and study groups — all in one nature-themed learning hub." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm"><Link to="/auth">Sign in</Link></Button>
            <Button asChild size="sm"><Link to="/auth">Get started</Link></Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <img src={heroImg} alt="Forest canopy" className="absolute inset-0 h-full w-full object-cover" width={1536} height={1024} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, oklch(0.18 0.05 150 / 0.55), oklch(0.18 0.05 150 / 0.9))" }} />
        <div className="relative mx-auto max-w-5xl px-4 py-24 md:py-36 text-center" style={{ color: "oklch(0.97 0.02 130)" }}>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs backdrop-blur">
            <Sparkles className="size-3.5" /> Nature-themed learning for every age
          </div>
          <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight">
            Grow your mind with <span style={{ background: "var(--gradient-leaf)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>HAM PRO</span>
          </h1>
          <p className="mt-5 text-base md:text-lg max-w-2xl mx-auto opacity-90">
            An all-in-one education app from primary school through university. AI tutor, interactive labs, photo identification with downloadable notes, multiple syllabuses including the Zambian curriculum, tests and live study groups.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg"><Link to="/auth">Start learning free</Link></Button>
            <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"><Link to="/auth">Sign in</Link></Button>
          </div>
          <p className="mt-10 text-xs opacity-75">Crafted by Josiah Brian Chirambo</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-3xl font-bold text-center">Everything you need to learn</h2>
        <p className="text-center text-muted-foreground mt-2 max-w-2xl mx-auto">Built for primary, secondary and tertiary students — works beautifully on phones, tablets and desktops.</p>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-[var(--shadow-leaf)] transition-shadow">
              <div className="size-11 rounded-xl flex items-center justify-center text-primary-foreground" style={{ background: "var(--gradient-leaf)" }}>
                <f.icon className="size-5" />
              </div>
              <h3 className="mt-4 font-semibold text-lg">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} HAM PRO — Created by <span className="font-semibold text-foreground">Josiah Brian Chirambo</span>
      </footer>
    </div>
  );
}

const FEATURES = [
  { icon: Bot, title: "AI Tutor chatbot", desc: "Ask anything, get clear step-by-step explanations from an AI tutor trained for school." },
  { icon: FlaskConical, title: "50+ interactive labs", desc: "Hands-on simulations across physics, chemistry, biology, math and computing." },
  { icon: Camera, title: "Identify with camera", desc: "Snap a photo or upload one — instantly get an explanation and downloadable notes." },
  { icon: BookOpen, title: "Multiple syllabuses", desc: "Browse Zambian (ECZ), Cambridge, IB, common-core and university-level topics." },
  { icon: GraduationCap, title: "Tests & quizzes", desc: "Generate practice tests by topic and grade level, then track your scores." },
  { icon: Users, title: "Study groups", desc: "Chat live with classmates around the world in subject-based study rooms." },
];
