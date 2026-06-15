import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Download, NotebookPen, Plus, Search, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

export const Route = createFileRoute("/_authenticated/notes")({
  head: () => ({ meta: [{ title: "My Notes — HAM PRO" }] }),
  component: NotesPage,
});

type Note = {
  id: string;
  title: string;
  subject: string | null;
  syllabus: string | null;
  level: string | null;
  content: string;
  created_at: string;
};

const OFFLINE_KEY = "hampro_offline_notes_v1";

function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [active, setActive] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase.from("notes").select("*").order("created_at", { ascending: false });
    if (error) {
      // Offline fallback
      try {
        const cached = JSON.parse(localStorage.getItem(OFFLINE_KEY) || "[]") as Note[];
        setNotes(cached);
        toast.info("Showing offline notes");
      } catch { setNotes([]); }
    } else {
      setNotes(data as Note[]);
      try { localStorage.setItem(OFFLINE_KEY, JSON.stringify(data)); } catch {}
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return notes;
    const needle = q.toLowerCase();
    return notes.filter((n) =>
      n.title.toLowerCase().includes(needle) ||
      (n.subject ?? "").toLowerCase().includes(needle) ||
      n.content.toLowerCase().includes(needle)
    );
  }, [notes, q]);

  async function save() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error("Sign in to save notes");
    if (!title.trim() || !content.trim()) return toast.error("Title and content are required");
    const { error } = await supabase.from("notes").insert({
      user_id: user.id, title: title.trim(), subject: subject.trim() || null, content,
    });
    if (error) return toast.error(error.message);
    setTitle(""); setSubject(""); setContent(""); setOpen(false);
    toast.success("Note saved");
    load();
  }

  async function remove(id: string) {
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  }

  function download(n: Note) {
    const blob = new Blob([`# ${n.title}\n\n${n.content}`], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${n.title.replace(/[^a-z0-9]+/gi, "-")}.md`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><NotebookPen className="text-primary" /> My Notes</h1>
          <p className="text-muted-foreground mt-1 text-sm">Search, organize and download your study notes. Saved notes are cached for offline reading.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="size-4" /> New note</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>New note</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Photosynthesis summary" /></div>
              <div><Label>Subject</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Biology" /></div>
              <div><Label>Content (markdown)</Label><Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} /></div>
              <Button className="w-full" onClick={save}>Save note</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-5 relative">
        <Search className="size-4 absolute left-3 top-3 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, subject, or content…" className="pl-9" />
      </div>

      {loading ? (
        <p className="mt-8 text-sm text-muted-foreground">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="mt-12 text-center text-sm text-muted-foreground border border-dashed rounded-xl p-10">
          {q ? "No notes match your search." : "No notes yet. Click ‘New note’ to add one, or save notes from the Identify page."}
        </div>
      ) : (
        <div className="mt-5 grid md:grid-cols-2 gap-3">
          {filtered.map((n) => (
            <div key={n.id} className="rounded-xl border bg-card p-4 hover:shadow-[var(--shadow-leaf)] transition">
              <button className="text-left w-full" onClick={() => setActive(n)}>
                <p className="font-semibold">{n.title}</p>
                {n.subject && <p className="text-xs text-muted-foreground mt-0.5">{n.subject}</p>}
                <p className="text-xs text-muted-foreground mt-2 line-clamp-3 whitespace-pre-wrap">{n.content.slice(0, 200)}</p>
              </button>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => download(n)}><Download className="size-3.5" /> Download</Button>
                <Button size="sm" variant="ghost" onClick={() => remove(n.id)}><Trash2 className="size-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {active && (
            <>
              <DialogHeader><DialogTitle>{active.title}</DialogTitle></DialogHeader>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{active.content}</ReactMarkdown>
              </div>
              <Button size="sm" variant="outline" onClick={() => download(active)} className="mt-2 w-fit"><Download className="size-3.5" /> Download .md</Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}