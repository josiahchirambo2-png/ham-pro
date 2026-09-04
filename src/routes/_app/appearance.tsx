import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Moon, Sun, MonitorSmartphone, Palette, Check } from "lucide-react";
import { APPEARANCE_EVENT, getScheme, saveScheme, type Scheme } from "@/lib/appearance";

export const Route = createFileRoute("/_app/appearance")({
  head: () => ({
    meta: [
      { title: "Colour scheme — KIT AI" },
      { name: "description", content: "Switch KIT AI between light, dark, or match your device's power and display settings." },
      { property: "og:title", content: "Colour scheme — KIT AI" },
      { property: "og:description", content: "Light, dark, or follow your device settings." },
    ],
  }),
  component: Appearance,
});

const OPTIONS: { id: Scheme; label: string; desc: string; icon: typeof Sun }[] = [
  { id: "light", label: "Light", desc: "Bright and clear — the KIT AI default.", icon: Sun },
  { id: "dark", label: "Dark", desc: "Easier on the eyes at night.", icon: Moon },
  { id: "system", label: "Match my device", desc: "Follows your device display and power-saving settings.", icon: MonitorSmartphone },
];

function Appearance() {
  const [scheme, setScheme] = useState<Scheme>("light");
  useEffect(() => {
    const read = () => setScheme(getScheme());
    read();
    window.addEventListener(APPEARANCE_EVENT, read);
    return () => window.removeEventListener(APPEARANCE_EVENT, read);
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold flex items-center gap-2"><Palette className="text-primary" /> Colour scheme</h1>
      <p className="text-muted-foreground mt-1">Choose how KIT AI looks on this device.</p>

      <div className="mt-6 grid sm:grid-cols-3 gap-4">
        {OPTIONS.map((o) => {
          const active = scheme === o.id;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => saveScheme(o.id)}
              className={`text-left rounded-2xl border bg-card p-5 transition hover:shadow-[var(--shadow-leaf)] ${active ? "border-primary ring-2 ring-primary/40" : "border-border"}`}
            >
              <div className="flex items-center justify-between">
                <o.icon className="size-5 text-primary" />
                {active && <Check className="size-4 text-primary" />}
              </div>
              <p className="mt-3 font-semibold">{o.label}</p>
              <p className="text-sm text-muted-foreground mt-1">{o.desc}</p>
            </button>
          );
        })}
      </div>

    </div>
  );
}