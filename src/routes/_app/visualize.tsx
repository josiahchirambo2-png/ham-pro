import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Download, Loader2, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { streamImage } from "@/lib/streamImage";

export const Route = createFileRoute("/_app/visualize")({
  head: () => ({
    meta: [
      { title: "AI Diagrams & Images — HAM PRO" },
      { name: "description", content: "Generate labelled study diagrams, illustrations and visual explanations with HAM's AI image generator." },
      { property: "og:title", content: "AI Diagrams & Images — HAM PRO" },
      { property: "og:description", content: "Turn any topic into a clear, labelled study diagram or illustration." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Visualize,
});

const STYLES = [
  { v: "labelled science diagram, clean vector style, white background, clear black labels with leader lines, textbook accurate", l: "Labelled diagram" },
  { v: "flowchart / process diagram with boxes and arrows, clean minimal vector, readable labels, white background", l: "Flowchart / process" },
  { v: "cutaway cross-section illustration with labels, educational textbook style, white background", l: "Cross-section" },
  { v: "colourful friendly cartoon illustration for young learners, simple shapes, cheerful", l: "Kid-friendly illustration" },
  { v: "photorealistic educational reference image, high detail, neutral background", l: "Realistic image" },
  { v: "concept map / mind map with connected nodes, clean modern design, readable text", l: "Mind map" },
  { v: "horizontal timeline with evenly spaced dated milestones on a central line, clean flat vector, readable labels, white background", l: "Timeline" },
];

const DIAGRAM = "labelled science diagram, clean vector style, white background, clear black labels with leader lines, textbook accurate";
const FLOW = "flowchart / process diagram with boxes and arrows, clean minimal vector, readable labels, white background";
const MAP = "concept map / mind map with connected nodes, clean modern design, readable text";
const TIME = "horizontal timeline with evenly spaced dated milestones on a central line, clean flat vector, readable labels, white background";
const CUT = "cutaway cross-section illustration with labels, educational textbook style, white background";
const KID = "colourful friendly cartoon illustration for young learners, simple shapes, cheerful";

const TEMPLATES = [
  { l: "Mind map", c: "Thinking tools", d: "Central topic with branching ideas", p: "A mind map of the topic in the centre with 6 clearly labelled branches and sub-branches", s: MAP },
  { l: "Flowchart", c: "Thinking tools", d: "Step-by-step process with arrows", p: "A step-by-step flowchart of the process, from start to finish, with decision diamonds and arrows", s: FLOW },
  { l: "Timeline", c: "Thinking tools", d: "Events in order with dates", p: "A horizontal timeline of the key events in order, each milestone dated and briefly labelled", s: TIME },
  { l: "Compare & contrast", c: "Thinking tools", d: "Venn-style comparison", p: "A clear comparison diagram with two overlapping circles showing similarities in the middle and differences on each side", s: MAP },
  { l: "Cycle diagram", c: "Thinking tools", d: "Repeating circular process", p: "A circular cycle diagram with 5 labelled stages and arrows showing the direction of the cycle", s: FLOW },

  { l: "Biology cell", c: "Biology", d: "Labelled animal/plant cell", p: "A labelled diagram of a plant cell and an animal cell side by side, showing nucleus, cytoplasm, cell membrane, cell wall, chloroplasts, mitochondria and vacuole", s: DIAGRAM },
  { l: "Body system", c: "Biology", d: "Organs and their labels", p: "A labelled diagram of the human body system showing every major organ with leader lines and correct names", s: DIAGRAM },
  { l: "Food chain", c: "Biology", d: "Energy flow between species", p: "A food chain diagram showing producers, consumers and decomposers with arrows for energy flow, each organism labelled", s: FLOW },
  { l: "Life cycle", c: "Biology", d: "Stages of growth", p: "A circular life cycle diagram of the organism with each stage drawn and labelled in order", s: DIAGRAM },

  { l: "Circuit diagram", c: "Physics & Chemistry", d: "Components and symbols", p: "A clean electrical circuit diagram using standard symbols for the battery, switch, resistor, ammeter and bulb, with labels", s: DIAGRAM },
  { l: "Force diagram", c: "Physics & Chemistry", d: "Arrows showing forces", p: "A free-body force diagram with labelled arrows showing every force acting on the object and its direction", s: DIAGRAM },
  { l: "Atom / molecule", c: "Physics & Chemistry", d: "Structure and bonds", p: "A labelled atomic structure diagram showing protons, neutrons, electrons and electron shells, plus the bonding arrangement", s: DIAGRAM },
  { l: "Apparatus setup", c: "Physics & Chemistry", d: "Lab equipment drawing", p: "A labelled laboratory apparatus setup drawing in textbook line-art style, each piece of equipment named", s: DIAGRAM },

  { l: "Cross-section", c: "Earth & Geography", d: "Cutaway view with labels", p: "A labelled cutaway cross-section showing every internal layer clearly named", s: CUT },
  { l: "Water cycle", c: "Earth & Geography", d: "Evaporation to rainfall", p: "A labelled water cycle diagram over a mountain, lake and sea showing evaporation, condensation, precipitation and runoff", s: DIAGRAM },
  { l: "Map with key", c: "Earth & Geography", d: "Simple annotated map", p: "A simple clear map of the region with labelled features and a legend key in the corner", s: DIAGRAM },

  { l: "Kid-friendly poster", c: "Young learners", d: "Bright, simple and fun", p: "A bright, simple and cheerful learning poster about the topic with big friendly labels", s: KID },
  { l: "Counting / maths", c: "Young learners", d: "Visual maths helper", p: "A colourful visual maths helper showing the concept with countable objects and large clear numbers", s: KID },
] as const;

const CATEGORIES = ["All", ...Array.from(new Set(TEMPLATES.map((t) => t.c)))];

const EXAMPLES = [
  "The human heart with chambers, valves and blood flow",
  "The water cycle over a mountain and lake",
  "Photosynthesis inside a leaf cell",
  "The layers of the Earth",
  "A simple electric circuit with a battery, switch and bulb",
  "The stages of mitosis",
];

function Visualize() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState(STYLES[0].v);
  const [src, setSrc] = useState<string | null>(null);
  const [isFinal, setIsFinal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const q = query.trim().toLowerCase();
  const visibleTemplates = TEMPLATES.filter(
    (t) =>
      (category === "All" || t.c === category) &&
      (!q || t.l.toLowerCase().includes(q) || t.d.toLowerCase().includes(q) || t.c.toLowerCase().includes(q)),
  );

  async function generate(override?: { prompt: string; style: string }) {
    const topic = (override?.prompt ?? prompt).trim();
    const styleUsed = override?.style ?? style;
    if (!topic) return toast.error("Describe what you want to see");
    setBusy(true); setSrc(null); setIsFinal(false);
    try {
      await streamImage(
        `Educational visual for a student: ${topic}. Style: ${styleUsed}. Spelling of every label must be correct. No watermark.`,
        (dataUrl, final) => { setSrc(dataUrl); if (final) setIsFinal(true); },
      );
    } catch (e: any) {
      toast.error(e?.message ?? "Could not generate the image");
    } finally {
      setBusy(false);
    }
  }

  function useTemplate(t: (typeof TEMPLATES)[number]) {
    const topic = prompt.trim();
    const finalPrompt = topic ? `${t.p}. Topic: ${topic}` : t.p.replace("the topic", "a study topic of your choice").replace("the process", "a common science process");
    setPrompt(finalPrompt);
    setStyle(t.s);
    generate({ prompt: finalPrompt, style: t.s });
  }

  function download() {
    if (!src) return;
    const a = document.createElement("a");
    a.href = src;
    a.download = `${prompt.trim().replace(/[^a-z0-9]+/gi, "-").slice(0, 50) || "ham-pro-diagram"}.png`;
    a.click();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-bold flex items-center gap-2"><Sparkles className="text-primary" /> AI Diagrams &amp; Images</h1>
      <p className="text-muted-foreground mt-1">Describe any topic and HAM will draw a study diagram or illustration you can download.</p>

      <div className="mt-6 grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border bg-card p-5">
          <Label>What should HAM draw?</Label>
          <Textarea
            className="mt-1"
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. A labelled diagram of the human digestive system"
          />
          <div className="mt-3">
            <Label>Visual style</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STYLES.map((s) => <SelectItem key={s.v} value={s.v}>{s.l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {EXAMPLES.map((e) => (
              <button
                key={e}
                onClick={() => setPrompt(e)}
                className="text-xs rounded-full border px-2.5 py-1 text-muted-foreground hover:text-foreground hover:bg-accent/40 transition"
              >
                {e}
              </button>
            ))}
          </div>
          <div className="mt-4">
            <Label>Template gallery</Label>
            <div className="relative mt-1.5">
              <Search className="size-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search templates…"
                className="pl-8"
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`text-xs rounded-full border px-2.5 py-1 transition ${
                    category === c
                      ? "border-primary/50 bg-primary/15 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="mt-2.5 grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
              {visibleTemplates.map((t) => (
                <button
                  key={t.l}
                  disabled={busy}
                  onClick={() => useTemplate(t)}
                  className="rounded-xl border bg-background/40 p-3 text-left hover:bg-accent/40 hover:border-primary/40 transition disabled:opacity-50"
                >
                  <p className="text-sm font-semibold">{t.l}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{t.d}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wide text-primary/70">{t.c}</p>
                </button>
              ))}
              {visibleTemplates.length === 0 && (
                <p className="col-span-2 text-xs text-muted-foreground py-4 text-center">No templates match “{query}”.</p>
              )}
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">Type a topic above first to tailor a template to it.</p>
          </div>

          <Button className="mt-4 w-full" onClick={() => generate()} disabled={busy}>
            {busy ? <><Loader2 className="size-4 animate-spin" /> Drawing…</> : <><Sparkles className="size-4" /> Generate visual</>}
          </Button>
          <p className="mt-2 text-[11px] text-muted-foreground">Image generation needs an internet connection.</p>
        </div>

        <div className="rounded-2xl border bg-card p-5 min-h-[320px] flex flex-col">
          <div className="flex-1 rounded-xl bg-muted overflow-hidden flex items-center justify-center aspect-square">
            {src ? (
              <img
                src={src}
                alt={prompt || "Generated educational diagram"}
                className={`w-full h-full object-contain transition-[filter] duration-500 ${isFinal ? "blur-0" : "blur-xl"}`}
              />
            ) : (
              <span className="text-sm text-muted-foreground px-6 text-center">
                {busy ? "HAM is sketching your diagram…" : "Your diagram will appear here."}
              </span>
            )}
          </div>
          {src && isFinal && (
            <Button className="mt-4 w-fit" size="sm" variant="outline" onClick={download}>
              <Download className="size-4" /> Download PNG
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
