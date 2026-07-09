import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { FlaskConical, Atom, Calculator, Dna, Cpu, Waves, Magnet, Beaker, CircuitBoard, Microscope, Leaf, Triangle, Sigma, Binary, Globe, Zap, Telescope, FlaskRound, Brain, Search } from "lucide-react";
import { LABS } from "@/lib/labs-catalog";
import { LabSimulator } from "@/components/lab-simulator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { detectTier, tierForLab, TIER_LABEL, type LevelTier } from "@/lib/level";

export const Route = createFileRoute("/_app/labs")({
  head: () => ({ meta: [{ title: "Interactive Labs — HAM PRO" }] }),
  component: Labs,
});

const ICONS = [Atom, Calculator, Dna, Cpu, Waves, Magnet, Beaker, CircuitBoard, Microscope, Leaf, Triangle, Sigma, Binary, Globe, Zap, Telescope, FlaskRound, Brain, FlaskConical];

function Labs() {
  const [open, setOpen] = useState<number | null>(null);
  const [q, setQ] = useState("");
  const [myTier, setMyTier] = useState<LevelTier>("secondary");
  const [filter, setFilter] = useState<LevelTier | "all">("secondary");
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setFilter("all"); return; }
      const { data } = await supabase.from("profiles").select("education_level").eq("id", user.id).maybeSingle();
      const t = detectTier(data?.education_level);
      setMyTier(t); setFilter(t);
    })();
  }, []);
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return LABS.map((l, i) => ({ l, i })).filter(({ l }) => {
      if (filter !== "all" && tierForLab(l.title, l.subject) !== filter) return false;
      if (needle && !`${l.title} ${l.subject}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [q, filter]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold flex items-center gap-2"><FlaskConical className="text-primary" /> Interactive Labs</h1>
      <p className="text-muted-foreground mt-1">{LABS.length} hands-on simulations across sciences, math and computing. Every lab works offline once loaded.</p>
      <div className="mt-5 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-64 max-w-md">
          <Search className="size-4 absolute left-3 top-3 text-muted-foreground" />
          <Input placeholder="Search labs…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-1 text-xs">
          {(["primary", "secondary", "university", "all"] as const).map((t) => (
            <Button key={t} size="sm" variant={filter === t ? "default" : "outline"} onClick={() => setFilter(t)}>
              {t === "all" ? "All" : TIER_LABEL[t]}
            </Button>
          ))}
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Showing {TIER_LABEL[myTier]}-tuned labs based on your profile. Change filter above to see other levels.</p>
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