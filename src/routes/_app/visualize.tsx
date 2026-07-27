import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Loader2, Sparkles } from "lucide-react";
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
];

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

  async function generate() {
    const topic = prompt.trim();
    if (!topic) return toast.error("Describe what you want to see");
    setBusy(true); setSrc(null); setIsFinal(false);
    try {
      await streamImage(
        `Educational visual for a student: ${topic}. Style: ${style}. Spelling of every label must be correct. No watermark.`,
        (dataUrl, final) => { setSrc(dataUrl); if (final) setIsFinal(true); },
      );
    } catch (e: any) {
      toast.error(e?.message ?? "Could not generate the image");
    } finally {
      setBusy(false);
    }
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
          <Button className="mt-4 w-full" onClick={generate} disabled={busy}>
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
