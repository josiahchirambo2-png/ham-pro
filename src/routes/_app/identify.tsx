import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { identifyImage } from "@/lib/identify.functions";
import { useServerFn } from "@tanstack/react-start";
import { Camera, Upload, Download, Loader2 } from "lucide-react";
import { Save } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_app/identify")({
  head: () => ({ meta: [{ title: "Identify — HAM PRO" }] }),
  component: Identify,
});

function Identify() {
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ title: string; notes: string } | null>(null);
  const [syllabus, setSyllabus] = useState("Zambian (ECZ)");
  const identify = useServerFn(identifyImage);

  function pick(input: HTMLInputElement) {
    const f = input.files?.[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = () => { setPreview(reader.result as string); setResult(null); };
    reader.readAsDataURL(f);
  }

  async function run() {
    if (!preview) return;
    setBusy(true);
    try { setResult(await identify({ data: { imageDataUrl: preview, syllabus } })); }
    catch (e: any) { toast.error(e?.message ?? "Failed to identify"); }
    finally { setBusy(false); }
  }

  function download() {
    if (!result) return;
    const blob = new Blob([result.notes], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${result.title.replace(/[^a-z0-9]+/gi, "-")}.md`; a.click();
    URL.revokeObjectURL(url);
  }

  async function saveToNotes() {
    if (!result) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error("Sign in to save notes");
    const { error } = await supabase.from("notes").insert({
      user_id: user.id, title: result.title, subject: null, syllabus, content: result.notes, source: "identify",
    });
    if (error) return toast.error(error.message);
    toast.success("Saved to My Notes");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold">Identify & get notes</h1>
      <p className="text-muted-foreground mt-1">Take a photo or upload an image. HAM PRO identifies it and produces downloadable study notes.</p>

      <div className="mt-6 grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border bg-card p-5">
          <div className="aspect-square rounded-xl bg-muted overflow-hidden flex items-center justify-center">
            {preview ? <img src={preview} alt="To identify" className="w-full h-full object-contain" /> : <span className="text-sm text-muted-foreground">No image yet</span>}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <input ref={camRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => pick(e.currentTarget)} />
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => pick(e.currentTarget)} />
            <Button variant="outline" onClick={() => camRef.current?.click()}><Camera className="size-4" /> Camera</Button>
            <Button variant="outline" onClick={() => fileRef.current?.click()}><Upload className="size-4" /> Upload</Button>
          </div>
          <div className="mt-4">
            <label className="text-xs font-medium text-muted-foreground">Align notes with syllabus</label>
            <Select value={syllabus} onValueChange={setSyllabus}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Zambian (ECZ)", "Cambridge IGCSE/A-Level", "International Baccalaureate", "Common Core (US)", "UK National Curriculum", "University"].map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className="mt-4 w-full" onClick={run} disabled={!preview || busy}>
            {busy ? <><Loader2 className="size-4 animate-spin" /> Identifying…</> : "Identify & generate notes"}
          </Button>
        </div>
        <div className="rounded-2xl border bg-card p-5 min-h-[300px]">
          {result ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-semibold">{result.title}</h2>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={saveToNotes}><Save className="size-4" /> Save</Button>
                  <Button size="sm" onClick={download}><Download className="size-4" /> .md</Button>
                </div>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none mt-3">
                <ReactMarkdown>{result.notes}</ReactMarkdown>
              </div>
            </>
          ) : <p className="text-sm text-muted-foreground">Notes will appear here.</p>}
        </div>
      </div>
    </div>
  );
}