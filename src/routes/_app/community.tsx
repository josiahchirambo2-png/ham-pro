import { createFileRoute, Link, Outlet, useMatchRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, Lock, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/community")({
  head: () => ({ meta: [{ title: "Community — HAM PRO" }] }),
  component: Community,
});

type Group = { id: string; name: string; subject: string | null; description: string | null; is_private: boolean; created_by: string | null };

function Community() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [me, setMe] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [creating, setCreating] = useState(false);
  const matchRoute = useMatchRoute();
  const inChild = !!matchRoute({ to: "/community/$groupId" });

  async function load() {
    const { data } = await supabase
      .from("study_groups")
      .select("id,name,subject,description,is_private,created_by")
      .order("created_at");
    setGroups((data as Group[]) ?? []);
  }
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMe(data.user?.id ?? null));
    load();
  }, []);

  async function createGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!me || !name.trim()) return;
    setCreating(true);
    const { data, error } = await supabase
      .from("study_groups")
      .insert({ name: name.trim(), subject: subject.trim() || null, description: description.trim() || null, is_private: isPrivate, created_by: me })
      .select("id")
      .single();
    if (error || !data) { setCreating(false); toast.error(error?.message ?? "Could not create group"); return; }
    if (isPrivate) {
      await supabase.from("group_members").insert({ group_id: data.id, user_id: me, added_by: me });
    }
    setCreating(false); setShowCreate(false);
    setName(""); setSubject(""); setDescription(""); setIsPrivate(true);
    toast.success("Group created");
    load();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Users className="text-primary" /> Study Groups</h1>
          <p className="text-muted-foreground mt-1">Education-focused chats. Public rooms for everyone, private rooms for friends &amp; family.</p>
        </div>
        {!inChild && (
          <Button onClick={() => setShowCreate((v) => !v)} size="sm">
            {showCreate ? <><X className="size-4" /> Cancel</> : <><Plus className="size-4" /> New group</>}
          </Button>
        )}
      </div>

      {!inChild && showCreate && (
        <form onSubmit={createGroup} className="mt-6 rounded-2xl border bg-card p-5 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Family study club" required maxLength={80} /></div>
            <div className="space-y-1"><Label>Subject</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Math, Biology, …" maxLength={40} /></div>
          </div>
          <div className="space-y-1"><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What will you study together?" maxLength={300} /></div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />
            Private — only people you invite can see or chat here
          </label>
          <Button type="submit" disabled={creating || !name.trim()}>{creating ? "Creating…" : "Create group"}</Button>
        </form>
      )}

      {!inChild && (
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((g) => (
            <Link key={g.id} to="/community/$groupId" params={{ groupId: g.id }} className="rounded-2xl border bg-card p-5 hover:shadow-[var(--shadow-leaf)] transition">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase text-muted-foreground">{g.subject ?? "General"}</p>
                {g.is_private && <span className="text-[10px] flex items-center gap-1 text-primary"><Lock className="size-3" /> Private</span>}
              </div>
              <h2 className="font-semibold mt-1">{g.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">{g.description}</p>
            </Link>
          ))}
          {groups.length === 0 && <p className="text-sm text-muted-foreground">No groups yet — create one to get started.</p>}
        </div>
      )}
      <Outlet />
    </div>
  );
}