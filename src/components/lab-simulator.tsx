import { useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Lab3D } from "@/components/lab-3d";

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

  return (
    <div className="grid md:grid-cols-2 gap-5">
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
          {config.render ? config.render(values) : <Lab3D title={config.title} subject={config.subject} params={values} />}
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