import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import heroImg from "@/assets/nature-hero.jpg";
import { Bot, Camera, FlaskConical, BookOpen, Users, GraduationCap, Sparkles, UserRound, ExternalLink } from "lucide-react";

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
  const navigate = useNavigate();

  // Already signed in? Skip the landing/sign-in flow entirely.
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) navigate({ to: "/dashboard", replace: true });
    });
    return () => { active = false; };
  }, [navigate]);

  return (
    <div className="min-h-dvh bg-background text-foreground az-grid-bg">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5"><span className="az-dot" aria-hidden="true" /><Logo /></div>
          <a
            href="https://brand-bios-showcase.lovable.app"
            target="_blank"
            rel="noopener noreferrer"
            className="az-eyebrow inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors"
          >
            <UserRound className="size-3.5" /> About the developer
          </a>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <img src={heroImg} alt="Forest canopy" className="absolute inset-0 h-full w-full object-cover" width={1536} height={1024} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, oklch(0.13 0.05 250 / 0.82), oklch(0.16 0.09 275 / 0.9) 55%, oklch(0.14 0.06 205 / 0.94))" }} />
        <div className="pointer-events-none absolute inset-0 az-grid-bg opacity-50" aria-hidden="true" />
        <div className="relative mx-auto max-w-5xl px-4 py-24 md:py-40 text-center" style={{ color: "oklch(0.97 0.015 235)" }}>
          <div className="az-eyebrow inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 backdrop-blur">
            <Sparkles className="size-3.5" /> Installable · Voice-controlled · Works offline
          </div>
          <h1 className="az-display mt-7 text-4xl md:text-7xl leading-[1.03]">
            Grow your mind with <span className="az-gradient-text">HAM PRO</span>
          </h1>
          <p className="mt-6 text-base md:text-lg max-w-2xl mx-auto opacity-85 leading-relaxed">
            An all-in-one learning app from primary school through university. Meet HAM — your voice-enabled AI tutor — plus 60+ interactive labs, identify-with-camera notes, the Zambian syllabus and more. Install it on any device and keep learning even when you're offline.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="rounded-full px-7 az-glow-ring"><Link to="/auth">Get started</Link></Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <p className="az-eyebrow text-center text-muted-foreground">Environments</p>
        <h2 className="az-display mt-3 text-2xl md:text-4xl text-center">Everything you need to learn</h2>
        <p className="text-center text-muted-foreground mt-4 max-w-2xl mx-auto leading-relaxed">Built for primary, secondary and university students — themes adapt to your level and the whole app installs to your phone, tablet or desktop.</p>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="az-panel az-panel-hover p-6">
              <span className="az-eyebrow text-muted-foreground/70">{String(i + 1).padStart(2, "0")}</span>
              <div className="mt-3 size-11 rounded-xl flex items-center justify-center text-primary-foreground az-glow-ring" style={{ background: "var(--gradient-leaf)" }}>
                <f.icon className="size-5" />
              </div>
              <h3 className="az-display mt-5 text-[15px]">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              <div className="az-meter mt-5"><span style={{ width: `${40 + ((i * 17) % 55)}%` }} /></div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-20">
        <div className="az-panel p-10 text-center">
          <div className="mx-auto size-12 rounded-xl flex items-center justify-center text-primary-foreground az-glow-ring" style={{ background: "var(--gradient-leaf)" }}>
            <UserRound className="size-6" />
          </div>
          <h2 className="az-display mt-5 text-xl md:text-2xl">About the developer</h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            HAM PRO was designed and built by Josiah Brian Chirambo. Read his full story, portfolio and other projects.
          </p>
          <Button asChild className="mt-6 rounded-full px-6">
            <a href="https://brand-bios-showcase.lovable.app" target="_blank" rel="noopener noreferrer">
              Visit the developer's page <ExternalLink className="size-4" />
            </a>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs tracking-wide text-muted-foreground">
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
