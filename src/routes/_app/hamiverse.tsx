import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, FlaskConical, Telescope, Notebook, Plus, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LABS } from "@/lib/labs-catalog";
import { LabSimulator } from "@/components/lab-simulator";
import { detectTier, tierForLab, TIER_LABEL, type LevelTier } from "@/lib/level";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/hamiverse")({
  head: () => ({
    meta: [
      { title: "KITVERSE — KIT AI" },
      { name: "description", content: "KITVERSE — grade-tuned labs, a 3D galaxy explorer, and your personal research notes." },
    ],
  }),
  component: HamiversePage,
});

function HamiversePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="rounded-3xl p-6 md:p-8 text-white shadow-[var(--shadow-leaf)]" style={{ background: "var(--gradient-canopy)" }}>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs backdrop-blur">
          <Sparkles className="size-3.5" /> KITVERSE
        </div>
        <h1 className="mt-4 text-3xl md:text-4xl font-bold">Your learning universe</h1>
        <p className="mt-2 opacity-90 max-w-2xl">Explore labs tuned to your level, wander the galaxy in 3D, and keep a research journal.</p>
      </div>
      <Tabs defaultValue="labs" className="mt-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="labs"><FlaskConical className="size-4" /> Labs</TabsTrigger>
          <TabsTrigger value="galaxy"><Telescope className="size-4" /> Galaxy</TabsTrigger>
          <TabsTrigger value="research"><Notebook className="size-4" /> Research</TabsTrigger>
        </TabsList>
        <TabsContent value="labs" className="mt-4"><LevelLabs /></TabsContent>
        <TabsContent value="galaxy" className="mt-4"><GalaxyExplorer /></TabsContent>
        <TabsContent value="research" className="mt-4"><ResearchNotes /></TabsContent>
      </Tabs>
    </div>
  );
}

function LevelLabs() {
  const [level, setLevel] = useState<LevelTier>("secondary");
  const [override, setOverride] = useState<LevelTier | "all">("all");
  const [open, setOpen] = useState<number | null>(null);
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("education_level").eq("id", user.id).maybeSingle();
      if (data?.education_level) setLevel(detectTier(data.education_level));
    })();
  }, []);
  const active: LevelTier = override === "all" ? level : override;
  const filtered = useMemo(
    () => LABS.map((l, i) => ({ l, i })).filter(({ l }) => tierForLab(l.title, l.subject) === active),
    [active]
  );
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Your level: <b className="text-foreground">{TIER_LABEL[level]}</b></span>
        <div className="ml-auto flex gap-1">
          {(["primary", "secondary", "university"] as const).map((t) => (
            <Button key={t} size="sm" variant={override === t ? "default" : "outline"} onClick={() => setOverride(t)}>{TIER_LABEL[t]}</Button>
          ))}
        </div>
      </div>
      <div className="mt-4 grid sm:grid-cols-2 md:grid-cols-3 gap-3">
        {filtered.map(({ l, i }) => (
          <button key={l.title} onClick={() => setOpen(i)} className="text-left rounded-xl border bg-card p-4 hover:shadow-[var(--shadow-leaf)] transition">
            <p className="font-medium text-sm">{l.title}</p>
            <p className="text-xs text-muted-foreground">{l.subject}</p>
            <span className="mt-2 inline-block text-[10px] rounded-full px-2 py-0.5 bg-primary text-primary-foreground">{TIER_LABEL[active]}</span>
          </button>
        ))}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground col-span-full">No labs matched this level.</p>}
      </div>
      <Dialog open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {open !== null && (
            <>
              <DialogHeader><DialogTitle>{LABS[open].title}</DialogTitle></DialogHeader>
              <LabSimulator config={LABS[open]} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GalaxyExplorer() {
  // Simple canvas 2D "galaxy" — orbiting planets. No new deps.
  const ref = useRef<HTMLCanvasElement>(null);
  const [selected, setSelected] = useState<typeof PLANETS[number] | null>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    let raf = 0; let t = 0;
    const dpr = window.devicePixelRatio || 1;
    function resize() { c!.width = c!.clientWidth * dpr; c!.height = 480 * dpr; }
    resize();
    window.addEventListener("resize", resize);
    function draw() {
      const W = c!.width, H = c!.height;
      ctx.fillStyle = "#050914"; ctx.fillRect(0, 0, W, H);
      // stars
      for (let i = 0; i < 120; i++) {
        const x = (i * 97) % W, y = (i * 53) % H;
        ctx.fillStyle = i % 7 === 0 ? "#a3c9ff" : "#ffffff";
        ctx.globalAlpha = 0.4 + 0.6 * Math.sin(t * 0.05 + i);
        ctx.fillRect(x, y, 2 * dpr, 2 * dpr);
      }
      ctx.globalAlpha = 1;
      const cx = W / 2, cy = H / 2;
      // sun
      const g = ctx.createRadialGradient(cx, cy, 5 * dpr, cx, cy, 40 * dpr);
      g.addColorStop(0, "#fff2a6"); g.addColorStop(1, "rgba(255,180,0,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, 40 * dpr, 0, Math.PI * 2); ctx.fill();
      PLANETS.forEach((p, i) => {
        const a = t * p.speed + i;
        const r = p.orbit * dpr;
        const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
        ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(x, y, p.size * dpr, 0, Math.PI * 2); ctx.fill();
      });
      t += 0.01;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="md:col-span-2 rounded-2xl border overflow-hidden bg-black">
        <canvas ref={ref} className="w-full block" style={{ height: 480 }} />
      </div>
      <div className="rounded-2xl border p-4 bg-card">
        <h3 className="font-semibold">Planets</h3>
        <p className="text-xs text-muted-foreground">Tap a planet to learn about it.</p>
        <div className="mt-3 space-y-1">
          {PLANETS.map((p) => (
            <button key={p.name} onClick={() => setSelected(p)} className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent/50 flex items-center gap-2 text-sm">
              <span className="size-3 rounded-full" style={{ background: p.color }} />
              {p.name}
            </button>
          ))}
        </div>
        {selected && (
          <div className="mt-4 rounded-lg bg-muted/50 p-3 text-sm">
            <p className="font-semibold">{selected.name}</p>
            <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground list-disc pl-4">
              {selected.facts.map((f) => <li key={f}>{f}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

const PLANETS = [
  {
    name: "Mercury", orbit: 55, size: 3, speed: 1.2, color: "#a6a6a6",
    facts: [
      "Smallest planet in the Solar System, only slightly larger than Earth's Moon.",
      "Closest planet to the Sun, orbiting at about 58 million kilometres.",
      "One Mercury year lasts just 88 Earth days — the fastest orbit of all.",
      "A single day on Mercury lasts about 59 Earth days because it spins slowly.",
      "Daytime temperatures reach 430 °C while night falls to about -180 °C.",
      "It has almost no atmosphere, so the sky stays black and there is no weather.",
      "Its surface is covered in craters, much like the Moon, from ancient impacts.",
      "It has a huge iron core making up roughly 85 percent of its radius.",
    ],
  },
  {
    name: "Venus", orbit: 80, size: 5, speed: 0.9, color: "#e5c07b",
    facts: [
      "Venus is the second planet from the Sun and Earth's nearest neighbour.",
      "It is the hottest planet at about 465 °C, hotter even than Mercury.",
      "A runaway greenhouse effect traps heat under thick carbon dioxide clouds.",
      "Its clouds are made of sulfuric acid, so rain never reaches the ground.",
      "Surface pressure is 92 times Earth's — like being 900 metres underwater.",
      "Venus spins backwards, so the Sun rises in the west and sets in the east.",
      "One Venus day is longer than its year: 243 Earth days versus 225.",
      "It is often called Earth's twin because of its similar size and mass.",
    ],
  },
  {
    name: "Earth", orbit: 110, size: 5, speed: 0.7, color: "#4aa3ff",
    facts: [
      "Earth is the third planet from the Sun and the only known home of life.",
      "About 71 percent of its surface is covered by liquid water oceans.",
      "Its atmosphere is 78 percent nitrogen and 21 percent oxygen.",
      "A magnetic field from its molten iron core shields us from solar radiation.",
      "Earth completes one spin every 24 hours and one orbit every 365.25 days.",
      "Its 23.5 degree tilt gives us the seasons as it travels around the Sun.",
      "The Moon, our only natural satellite, drives the ocean tides.",
      "Moving tectonic plates build mountains and cause earthquakes and volcanoes.",
    ],
  },
  {
    name: "Mars", orbit: 140, size: 4, speed: 0.55, color: "#e06b4d",
    facts: [
      "Mars is the fourth planet from the Sun and is known as the Red Planet.",
      "Rusty iron oxide dust across its surface gives it the reddish colour.",
      "It hosts Olympus Mons, the tallest volcano in the Solar System at 22 km.",
      "Valles Marineris is a canyon system over 4,000 kilometres long.",
      "A Martian day is 24 hours 37 minutes, very close to an Earth day.",
      "Its thin carbon dioxide atmosphere is under one percent of Earth's pressure.",
      "Polar ice caps hold frozen water and frozen carbon dioxide, or dry ice.",
      "Two small moons, Phobos and Deimos, orbit Mars closely.",
    ],
  },
  {
    name: "Jupiter", orbit: 180, size: 12, speed: 0.35, color: "#d8ba8b",
    facts: [
      "Jupiter is the largest planet — over 1,300 Earths could fit inside it.",
      "It is a gas giant made mostly of hydrogen and helium with no solid surface.",
      "The Great Red Spot is a storm wider than Earth raging for centuries.",
      "It spins fastest of all planets, completing a day in under 10 hours.",
      "Jupiter has more than 90 known moons, including giant Ganymede.",
      "Its four Galilean moons were first seen by Galileo in 1610.",
      "Its magnetic field is the strongest of any planet in the Solar System.",
      "Its powerful gravity shields inner planets by pulling in comets and asteroids.",
    ],
  },
  {
    name: "Saturn", orbit: 215, size: 10, speed: 0.28, color: "#f0d68b",
    facts: [
      "Saturn is the sixth planet from the Sun and the second largest.",
      "It is famous for bright rings made of ice, rock and dust particles.",
      "The rings stretch about 280,000 kilometres wide but are very thin.",
      "It is the least dense planet and would float in a big enough ocean.",
      "Saturn is a gas giant of hydrogen and helium with no solid ground.",
      "One Saturn year equals about 29.5 Earth years.",
      "It has over 140 moons, led by Titan with its thick orange atmosphere.",
      "A six-sided hexagonal jet stream swirls around its north pole.",
    ],
  },
];

function ResearchNotes() {
  const [items, setItems] = useState<any[]>([]);
  const [signedIn, setSignedIn] = useState(true);
  const [topic, setTopic] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [q, setQ] = useState("");
  useEffect(() => { load(); }, []);
  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSignedIn(false); return; }
    setSignedIn(true);
    const { data } = await (supabase as any).from("research_notes").select("*").order("updated_at", { ascending: false });
    setItems(data ?? []);
  }
  async function add() {
    if (!title.trim() || !topic.trim()) return toast.error("Add a topic and title");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await (supabase as any).from("research_notes").insert({ user_id: user.id, topic, title, content });
    if (error) return toast.error(error.message);
    setTitle(""); setContent(""); toast.success("Saved"); load();
  }
  async function del(id: string) {
    const { error } = await (supabase as any).from("research_notes").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  }
  if (!signedIn) {
    return (
      <div className="rounded-xl border p-6 text-center">
        <p className="text-sm text-muted-foreground">Sign in to save research notes.</p>
        <Button asChild className="mt-3"><Link to="/auth">Sign in</Link></Button>
      </div>
    );
  }
  const filtered = items.filter((n) => !q.trim() || `${n.title} ${n.topic} ${n.content}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="md:col-span-1 rounded-2xl border p-4 bg-card space-y-2">
        <h3 className="font-semibold">New research note</h3>
        <Input placeholder="Topic (e.g. Astronomy)" value={topic} onChange={(e) => setTopic(e.target.value)} />
        <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea placeholder="What did you learn?" rows={5} value={content} onChange={(e) => setContent(e.target.value)} />
        <Button className="w-full" onClick={add}><Plus className="size-4" /> Save note</Button>
      </div>
      <div className="md:col-span-2 space-y-3">
        <div className="relative">
          <Search className="size-4 absolute left-3 top-3 text-muted-foreground" />
          <Input placeholder="Search notes…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        {filtered.length === 0 && <p className="text-sm text-muted-foreground">No notes yet — write your first one on the left.</p>}
        {filtered.map((n) => (
          <div key={n.id} className="rounded-xl border p-4 bg-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{n.topic}</span>
                <h4 className="font-semibold">{n.title}</h4>
              </div>
              <Button size="icon" variant="ghost" onClick={() => del(n.id)}><Trash2 className="size-4" /></Button>
            </div>
            {n.content && <p className="mt-2 text-sm whitespace-pre-wrap">{n.content}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}