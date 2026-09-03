import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Crown, Infinity as InfinityIcon, Sparkles, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/plans")({
  head: () => ({
    meta: [
      { title: "Plans & Pricing — HAM PRO" },
      { name: "description", content: "Compare the Free, Pro and Unlimited HAM PRO plans — AI tutoring, labs, tests, notes and study groups." },
      { property: "og:title", content: "Plans & Pricing — HAM PRO" },
      { property: "og:description", content: "Compare the Free, Pro and Unlimited HAM PRO plans." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlansPage,
});

const PAY_NUMBERS = ["+260 977873761", "+260 977935215"];

const PLANS = [
  {
    id: "free",
    name: "Free",
    icon: Sparkles,
    monthly: 0,
    yearly: 0,
    tagline: "Everything you need to start learning today.",
    cta: "Your current plan",
    highlight: false,
    features: [
      "HAM AI tutor — daily message allowance",
      "50+ interactive labs",
      "Practice tests and ECZ past papers",
      "Notes library with offline access",
      "Private study groups with room keys",
      "Install as an app on any device",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    icon: Crown,
    monthly: 5,
    yearly: 50,
    tagline: "For serious students who study every day.",
    cta: "Upgrade to Pro",
    highlight: true,
    features: [
      "Everything in Free",
      "Unlimited HAM tutor conversations",
      "Priority, faster AI responses",
      "AI Visuals — diagrams and mind maps",
      "HAMIVERSE labs and Galaxy Explorer",
      "Progress analytics and study schedule reminders",
    ],
  },
  {
    id: "unlimited",
    name: "Unlimited",
    icon: InfinityIcon,
    monthly: 12,
    yearly: 120,
    tagline: "Maximum power for classes, tutors and families.",
    cta: "Go Unlimited",
    highlight: false,
    features: [
      "Everything in Pro",
      "Unlimited image and diagram generation",
      "Unlimited past-paper and test generation",
      "Up to 5 learner profiles on one plan",
      "Bigger study groups with longer history",
      "Early access to new HAM features",
    ],
  },
] as const;

function PlansPage() {
  const [yearly, setYearly] = useState(false);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="rounded-3xl p-6 md:p-10 text-white shadow-[var(--shadow-leaf)]" style={{ background: "var(--gradient-canopy)" }}>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs backdrop-blur">
          <Crown className="size-3.5" /> Plans
        </div>
        <h1 className="mt-4 text-3xl md:text-4xl font-bold">Simple pricing that grows with you</h1>
        <p className="mt-2 opacity-90 max-w-2xl">
          Start free forever. Upgrade whenever you want more from HAM — no lock-in, cancel any time.
        </p>
      </div>

      <div className="mt-8 flex items-center justify-center gap-3">
        <span className={`text-sm ${yearly ? "text-muted-foreground" : "font-semibold"}`}>Monthly</span>
        <button
          type="button"
          role="switch"
          aria-checked={yearly}
          aria-label="Toggle yearly billing"
          onClick={() => setYearly((v) => !v)}
          className="relative h-7 w-12 rounded-full border border-border bg-muted transition-colors"
        >
          <span className={`absolute top-0.5 size-5 rounded-full bg-primary transition-all ${yearly ? "left-6" : "left-0.5"}`} />
        </button>
        <span className={`text-sm ${yearly ? "font-semibold" : "text-muted-foreground"}`}>
          Yearly <span className="text-primary">save 2 months</span>
        </span>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3 items-start">
        {PLANS.map((p) => {
          const price = yearly ? p.yearly : p.monthly;
          return (
            <div
              key={p.id}
              className={`relative rounded-3xl border bg-card p-6 md:p-7 ${p.highlight ? "border-primary shadow-[var(--shadow-leaf)] lg:-mt-3 lg:pb-10" : "border-border"}`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground">
                  Most popular
                </span>
              )}
              <div className="flex items-center gap-2">
                <p.icon className="size-5 text-primary" />
                <h2 className="text-lg font-semibold">{p.name}</h2>
              </div>
              <p className="mt-2 text-sm text-muted-foreground min-h-10">{p.tagline}</p>
              <div className="mt-5 flex items-end gap-1">
                <span className="text-4xl font-bold">${price}</span>
                <span className="pb-1 text-sm text-muted-foreground">/{yearly ? "year" : "month"}</span>
              </div>
              <Button className="mt-5 w-full" variant={p.highlight ? "default" : "outline"} disabled={p.id === "free"} asChild={p.id !== "free"}>
                {p.id === "free" ? <span>{p.cta}</span> : <a href="#how-to-pay">{p.cta}</a>}
              </Button>
              <ul className="mt-6 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2 text-sm">
                    <Check className="size-4 shrink-0 text-primary mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div id="how-to-pay" className="mt-10 rounded-3xl border border-border bg-card p-6 md:p-8">
        <h2 className="text-xl font-semibold flex items-center gap-2"><Smartphone className="size-5 text-primary" /> How to pay</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          Send your plan amount by mobile money to either number below, then message the same number with your account email.
          Your upgrade is activated manually once the payment is confirmed.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {PAY_NUMBERS.map((n) => (
            <span key={n} className="rounded-full border border-border px-4 py-2 text-sm font-medium">{n}</span>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {[
          { q: "Is the free plan really free?", a: "Yes. Tutoring, labs, tests, notes and private study groups stay free for every learner." },
          { q: "Can I change plans later?", a: "Any time. Upgrades apply immediately and downgrades take effect at the end of your billing month." },
          { q: "What happens when I cancel?", a: "You keep your notes, tests and groups, and simply return to the Free plan limits." },
          { q: "Do you offer school pricing?", a: "Unlimited covers up to five learners; message either number above for larger classes." },
        ].map((f) => (
          <div key={f.q} className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-semibold text-sm">{f.q}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
