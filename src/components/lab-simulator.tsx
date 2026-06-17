import { useMemo, useState, useEffect, lazy, Suspense } from "react";
import { CheckCircle2, CloudDownload } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

// Lazy-load the 3D scene bundle so it only downloads when a lab is opened.
// React unmounts the component when the dialog closes, releasing scene state.
const importLab3D = () => import("@/components/lab-3d");
const Lab3D = lazy(() => importLab3D().then((m) => ({ default: m.Lab3D })));

export type Param = { key: string; label: string; min: number; max: number; step?: number; unit?: string; default: number };
export type LabConfig = {
  title: string;
  subject: string;
  description: string;
  params: Param[];
  /** Compute outputs from current params; return labeled rows */
  compute: (p: Record<string, number>) => { label: string; value: string }[];
  /** Optional canvas-style visual using current params */
  render?: (p: Record<string, number>) => React.ReactNode;
  notes?: string[];
};

export function LabSimulator({ config }: { config: LabConfig }) {
  const initial = useMemo(() => Object.fromEntries(config.params.map((p) => [p.key, p.default])), [config]);
  const [values, setValues] = useState<Record<string, number>>(initial);
  const outputs = config.compute(values);

  // Track preload progress for the 2 background prefetches (Lab3D + Tutor).
  const TOTAL_TASKS = 2;
  const [done, setDone] = useState(0);
  const [hideStatus, setHideStatus] = useState(false);

  // Warm the cache for the next likely lab + the tutor route so subsequent
  // opens (and offline visits) are instant. Runs once per mount, idle-deferred.
  useEffect(() => {
    let cancelled = false;
    const tick = () => { if (!cancelled) setDone((n) => n + 1); };
    const run = () => {
      // Lab3D shares one chunk across every lab — re-importing is a no-op
      // after the first hit, but it ensures the SW caches it for offline use.
      importLab3D().then(tick, tick);
      // Prefetch the tutor route bundle in the background.
      import("@/routes/_authenticated/tutor").then(tick, tick);
    };
    const w = typeof window !== "undefined" ? (window as any) : null;
    const id = w?.requestIdleCallback ? w.requestIdleCallback(run, { timeout: 1500 }) : window.setTimeout(run, 400);
    return () => {
      cancelled = true;
      if (w?.cancelIdleCallback && typeof id === "number") w.cancelIdleCallback(id);
      else clearTimeout(id as number);
    };
  }, []);

  // Auto-hide the "Ready offline" chip a few seconds after completion.
  useEffect(() => {
    if (done < TOTAL_TASKS) return;
    const t = setTimeout(() => setHideStatus(true), 3500);
    return () => clearTimeout(t);
  }, [done]);

  const pct = Math.round((done / TOTAL_TASKS) * 100);
  const complete = done >= TOTAL_TASKS;

  return (
    <div className="grid md:grid-cols-2 gap-5">
      {!hideStatus && (
        <div
          role="status"
          aria-live="polite"
          className="md:col-span-2 -mb-1 flex items-center gap-3 rounded-lg border bg-background/60 px-3 py-2 text-xs animate-fade-in"
        >
          {complete ? (
            <CheckCircle2 className="size-4 text-primary shrink-0" />
          ) : (
            <CloudDownload className="size-4 text-primary shrink-0 animate-pulse" />
          )}
          <span className="font-medium">
            {complete ? "Ready offline" : "Preloading next lab & tutor…"}
          </span>
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: "var(--gradient-leaf, hsl(var(--primary)))",
              }}
            />
          </div>
          <span className="font-mono text-muted-foreground tabular-nums w-9 text-right">
            {pct}%
          </span>
        </div>
      )}
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{config.description}</p>
        {config.params.map((p) => (
          <div key={p.key}>
            <div className="flex items-center justify-between text-xs mb-1">
              <Label className="text-xs">{p.label}</Label>
              <span className="font-mono text-muted-foreground">{values[p.key].toFixed(p.step && p.step < 1 ? 2 : 0)} {p.unit ?? ""}</span>
            </div>
            <Slider
              min={p.min}
              max={p.max}
              step={p.step ?? 1}
              value={[values[p.key]]}
              onValueChange={(v) => setValues((s) => ({ ...s, [p.key]: v[0] }))}
            />
          </div>
        ))}
        {config.notes && config.notes.length > 0 && (
          <ul className="mt-3 text-xs text-muted-foreground list-disc pl-4 space-y-1">
            {config.notes.map((n, i) => <li key={i}>{n}</li>)}
          </ul>
        )}
      </div>
      <div className="rounded-xl border bg-muted/40 p-4">
        <div className="aspect-video rounded-lg bg-background/60 mb-3 overflow-hidden flex items-center justify-center relative">
          {config.render ? (
            config.render(values)
          ) : (
            <Suspense fallback={<div className="lab3d-fallback" aria-label="Loading diagram" />}>
              <Lab3D title={config.title} subject={config.subject} params={values} />
            </Suspense>
          )}
        </div>
        <div className="space-y-2">
          {outputs.map((o, i) => (
            <div key={i} className="flex items-center justify-between gap-3 text-sm rounded-lg bg-background/50 px-3 py-2">
              <span className="text-muted-foreground">{o.label}</span>
              <span className="font-mono font-semibold">{o.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}