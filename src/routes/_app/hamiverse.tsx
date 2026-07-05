import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ExternalLink, Sparkles, MessagesSquare, Trophy, Users } from "lucide-react";

const HAMIVERSE_URL = "https://app.base44.com/apps/6a39340140ecf6f84f00792f";

export const Route = createFileRoute("/_app/hamiverse")({
  head: () => ({
    meta: [
      { title: "HAMIVERSE — HAM PRO" },
      { name: "description", content: "Jump into HAMIVERSE — live chat rooms, quizzes and community learning that complement HAM PRO." },
      { property: "og:title", content: "HAMIVERSE — a companion universe for HAM PRO" },
      { property: "og:description", content: "Live chat rooms, quizzes and community learning that pair with HAM PRO." },
    ],
  }),
  component: HamiversePage,
});

function HamiversePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="rounded-3xl p-8 md:p-12 text-white shadow-[var(--shadow-leaf)]" style={{ background: "var(--gradient-canopy)" }}>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs backdrop-blur">
          <Sparkles className="size-3.5" /> Companion app
        </div>
        <h1 className="mt-5 text-4xl md:text-5xl font-bold tracking-tight">Enter HAMIVERSE</h1>
        <p className="mt-3 max-w-2xl opacity-90">
          HAMIVERSE is our companion universe for HAM PRO learners — hop into live topic rooms, take quick quizzes with friends and share what you're learning in real time.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild size="lg" variant="secondary">
            <a href={HAMIVERSE_URL} target="_blank" rel="noopener noreferrer">
              Open HAMIVERSE <ExternalLink className="size-4" />
            </a>
          </Button>
        </div>
      </div>

      <div className="mt-8 grid sm:grid-cols-3 gap-4">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="size-11 rounded-xl flex items-center justify-center text-primary-foreground" style={{ background: "var(--gradient-leaf)" }}>
              <f.icon className="size-5" />
            </div>
            <h3 className="mt-4 font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>

      <p className="mt-8 text-xs text-muted-foreground/80">
        HAMIVERSE opens in a new tab. Your HAM PRO progress stays here.
      </p>
    </div>
  );
}

const FEATURES = [
  { icon: MessagesSquare, title: "Live chat rooms", desc: "Public or invite-only rooms with room codes to share with your class." },
  { icon: Trophy, title: "Quizzes & results", desc: "Quick quizzes with saved scores so you can track improvement over time." },
  { icon: Users, title: "Community learning", desc: "Meet other HAM PRO learners and study the same topics together." },
];