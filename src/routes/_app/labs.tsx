import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FlaskConical, Atom, Calculator, Dna, Cpu, Waves, Magnet, Beaker, CircuitBoard, Microscope, Leaf, Triangle, Sigma, Binary, Globe, Zap, Telescope, FlaskRound, Brain, Search } from "lucide-react";
import { LABS } from "@/lib/labs-catalog";
import { LabSimulator } from "@/components/lab-simulator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_app/labs")({
  head: () => ({ meta: [{ title: "Interactive Labs — HAM PRO" }] }),
  component: Labs,
});

const ICONS = [Atom, Calculator, Dna, Cpu, Waves, Magnet, Beaker, CircuitBoard, Microscope, Leaf, Triangle, Sigma, Binary, Globe, Zap, Telescope, FlaskRound, Brain, FlaskConical];

function Labs() {
  const [open, setOpen] = useState<number | null>(null);
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    if (!q.trim()) return LABS.map((l, i) => ({ l, i }));
    const needle = q.toLowerCase();
    return LABS.map((l, i) => ({ l, i })).filter(({ l }) => l.title.toLowerCase().includes(needle) || l.subject.toLowerCase().includes(needle));
  }, [q]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold flex items-center gap-2"><FlaskConical className="text-primary" /> Interactive Labs</h1>
      <p className="text-muted-foreground mt-1">{LABS.length} hands-on simulations across sciences, math and computing. Every lab works offline once loaded.</p>
      <div className="mt-5 relative max-w-md">
        <Search className="size-4 absolute left-3 top-3 text-muted-foreground" />
        <Input placeholder="Search labs by name or subject…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
      </div>
      <div className="mt-6 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map(({ l, i }) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <button key={l.title} onClick={() => setOpen(i)} className="text-left rounded-xl border bg-card p-4 hover:shadow-[var(--shadow-leaf)] transition focus:outline-none focus:ring-2 focus:ring-ring">
              <div className="size-9 rounded-lg flex items-center justify-center text-primary-foreground" style={{ background: "var(--gradient-leaf)" }}>
                <Icon className="size-4" />
              </div>
              <p className="mt-3 font-medium text-sm">{l.title}</p>
              <p className="text-xs text-muted-foreground">{l.subject}</p>
              <span className="mt-2 inline-block text-[10px] rounded-full px-2 py-0.5 bg-primary text-primary-foreground">Open</span>
            </button>
          );
        })}
      </div>
      <Dialog open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {open !== null && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="text-xs rounded-full bg-secondary px-2 py-0.5">{LABS[open].subject}</span>
                  {LABS[open].title}
                </DialogTitle>
              </DialogHeader>
              <LabSimulator config={LABS[open]} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}