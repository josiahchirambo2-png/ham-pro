import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import heroImg from "@/assets/nature-hero.jpg";
import { Bot, Camera, FlaskConical, BookOpen, Users, GraduationCap, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HAM PRO — Offline-ready AI learning, primary to university" },
      { name: "description", content: "HAM PRO is an installable offline-ready AI learning app: HAM voice tutor, 60+ interactive labs, identify-with-camera notes, Zambian syllabus, tests and private study groups." },
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
          <span className="text-xs text-muted-foreground hidden sm:inline">Created by Josiah Brian Chirambo</span>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <img src={heroImg} alt="Forest canopy" className="absolute inset-0 h-full w-full object-cover" width={1536} height={1024} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, oklch(0.18 0.05 150 / 0.55), oklch(0.18 0.05 150 / 0.9))" }} />
        <div className="relative mx-auto max-w-5xl px-4 py-24 md:py-36 text-center" style={{ color: "oklch(0.97 0.02 130)" }}>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs backdrop-blur">
            <Sparkles className="size-3.5" /> Installable · Voice-controlled · Works offline
          </div>
          <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight">
            Grow your mind with <span style={{ background: "var(--gradient-leaf)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>HAM PRO</span>
          </h1>
          <p className="mt-5 text-base md:text-lg max-w-2xl mx-auto opacity-90">
            An all-in-one learning app from primary school through university. Meet HAM — your voice-enabled AI tutor — plus 60+ interactive labs, identify-with-camera notes, the Zambian syllabus and more. Install it on any device and keep learning even when you're offline.
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
        <p className="text-center text-muted-foreground mt-2 max-w-2xl mx-auto">Built for primary, secondary and university students — themes adapt to your level and the whole app installs to your phone, tablet or desktop.</p>
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
  { icon: Bot, title: "HAM — voice AI tutor", desc: "Talk to HAM with your voice, hear answers spoken back, adjust speed and voice gender. Quick voice commands like 'send' and 'stop'." },
  { icon: FlaskConical, title: "60+ interactive labs", desc: "Hands-on physics, chemistry, biology, math and computing simulations — every lab is open and runs on-device." },
  { icon: Camera, title: "Identify with camera", desc: "Snap or upload a photo and instantly get an explanation plus downloadable study notes." },
  { icon: BookOpen, title: "Syllabus library", desc: "Browse Zambian (ECZ), Cambridge, IB, common-core and university-level topics, all in one place." },
  { icon: GraduationCap, title: "Tests — even offline", desc: "Pick your own number of questions. Online uses AI; offline falls back to a built-in question bank automatically." },
  { icon: Users, title: "Safe study groups", desc: "Chat live with classmates, edit messages after sending, and create private rooms for friends and family." },
];
