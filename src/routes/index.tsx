import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import heroImg from "@/assets/chrome-blob.jpg";
import {
  Bot, Camera, FlaskConical, BookOpen, Users, GraduationCap, Mic,
  UserRound, ExternalLink, ArrowRight, ChevronRight, WifiOff, Smartphone,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KIT AI — Offline-ready AI learning, primary to university" },
      { name: "description", content: "KIT AI is an installable offline-ready AI learning app: KIT voice tutor, 60+ interactive labs, identify-with-camera notes, Zambian syllabus, tests and private study groups." },
      { property: "og:title", content: "KIT AI — Offline-ready AI learning" },
      { property: "og:description", content: "KIT voice tutor, 60+ interactive labs, identify-with-camera notes, Zambian syllabus, tests and study groups — installable and offline-ready." },
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
    <div className="dark min-h-dvh bg-background text-foreground antialiased">
      {/* Floating pill header */}
      <header className="fixed inset-x-0 top-4 z-40 px-4">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between rounded-full px-4 glass-panel">
          <Logo size={26} />
          <a
            href="https://brand-bios-showcase.lovable.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            About the developer <ChevronRight className="size-3.5" />
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <img
          src={heroImg}
          alt="Liquid chrome sculpture"
          className="pointer-events-none absolute inset-x-0 top-0 h-[92vh] w-full object-cover opacity-90"
          width={1536}
          height={1024}
        />
        <div className="absolute inset-0" style={{ background: "var(--gradient-veil)" }} />
        <div className="relative mx-auto max-w-3xl px-4 pb-16 pt-[62vh]">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground backdrop-blur">
            <Mic className="size-3.5" /> Installable · Voice · Offline
          </div>
          <h1 className="mt-6 text-5xl font-semibold leading-[1.02] tracking-tight md:text-6xl">
            Grow your mind
            <br />
            with <span className="chrome-text">KIT AI</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
            An all-in-one learning app from primary school through university. Meet KIT — your voice-enabled AI tutor — plus 60+ interactive labs, identify-with-camera notes, the Zambian syllabus and more. Install it on any device and keep learning even when you're offline.
          </p>
          <div className="mt-9">
            <Button asChild size="lg" className="rounded-full px-8 shadow-[var(--shadow-chrome)]" style={{ background: "var(--gradient-chrome)", color: "oklch(15% 0 0)" }}>
              <Link to="/auth">Get started <ArrowRight className="size-4" /></Link>
            </Button>
          </div>

          <div className="mt-14 flex items-center gap-4 rounded-3xl px-5 py-4 glass-panel">
            <span className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-secondary/50">
              <WifiOff className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Works without internet</p>
              <p className="text-xs text-muted-foreground">Labs, notes and tests keep running offline</p>
            </div>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-3xl px-4 py-20">
        <h2 className="text-3xl font-semibold tracking-tight">Everything you need to learn</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Built for primary, secondary and university students — themes adapt to your level and the whole app installs to your phone, tablet or desktop.
        </p>
        <div className="mt-10 grid gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-3xl p-6 glass-panel transition-shadow hover:shadow-[var(--shadow-chrome)]">
              <span className="grid size-10 place-items-center rounded-full border border-border bg-secondary/50">
                <f.icon className="size-4" />
              </span>
              <h3 className="mt-5 text-base font-medium">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Install */}
      <section className="mx-auto max-w-3xl px-4 pb-20">
        <div className="rounded-[2rem] p-10 text-center glass-panel">
          <span className="mx-auto grid size-12 place-items-center rounded-full border border-border bg-secondary/50">
            <Smartphone className="size-5" />
          </span>
          <h2 className="mt-5 text-2xl font-semibold tracking-tight">Install KIT AI on any device</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Phone, tablet or desktop — add it to your home screen once and your study hub is always a tap away.
          </p>
          <Button asChild className="mt-7 rounded-full px-7" style={{ background: "var(--gradient-chrome)", color: "oklch(15% 0 0)" }}>
            <Link to="/auth">Get started <ArrowRight className="size-4" /></Link>
          </Button>
        </div>
      </section>

      {/* Developer */}
      <section className="mx-auto max-w-3xl px-4 pb-20">
        <div className="rounded-[2rem] p-10 text-center glass-panel">
          <span className="mx-auto grid size-12 place-items-center rounded-full border border-border bg-secondary/50">
            <UserRound className="size-5" />
          </span>
          <h2 className="mt-5 text-2xl font-semibold tracking-tight">About the developer</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            KIT AI was designed and built by Josiah Brian Chirambo. Read his full story, portfolio and other projects.
          </p>
          <Button asChild variant="outline" className="mt-7 rounded-full px-7">
            <a href="https://brand-bios-showcase.lovable.app" target="_blank" rel="noopener noreferrer">
              Visit the developer's page <ExternalLink className="size-4" />
            </a>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-10 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} KIT AI — Created by <span className="text-foreground">Josiah Brian Chirambo</span>
      </footer>
    </div>
  );
}

const FEATURES = [
  { icon: Bot, title: "KIT — voice AI tutor", desc: "Talk to KIT with your voice, hear answers spoken back, adjust speed and voice gender. Quick voice commands like 'send' and 'stop'." },
  { icon: FlaskConical, title: "60+ interactive labs", desc: "Hands-on physics, chemistry, biology, math and computing simulations — every lab is open and runs on-device." },
  { icon: Camera, title: "Identify with camera", desc: "Snap or upload a photo and instantly get an explanation plus downloadable study notes." },
  { icon: BookOpen, title: "Syllabus library", desc: "Browse Zambian (ECZ), Cambridge, IB, common-core and university-level topics, all in one place." },
  { icon: GraduationCap, title: "Tests — even offline", desc: "Pick your own number of questions. Online uses AI; offline falls back to a built-in question bank automatically." },
  { icon: Users, title: "Safe study groups", desc: "Chat live with classmates, edit messages after sending, and create private rooms for friends and family." },
];
