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
  const [groupPassword, setGroupPassword] = useState("");
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
    if (!name.trim()) return;
    if (!me) { toast.error("Sign in to create a group"); return; }
    setCreating(true);
    const { data, error } = await supabase
      .from("study_groups")
      .insert({ name: name.trim(), subject: subject.trim() || null, description: description.trim() || null, is_private: true, created_by: me })
      .select("id")
      .single();
    if (error || !data) { setCreating(false); toast.error(error?.message ?? "Could not create group"); return; }
    await supabase.from("group_members").insert({ group_id: data.id, user_id: me, added_by: me });
    if (groupPassword.trim().length >= 4) {
      const { error: pwErr } = await (supabase as any).rpc("set_group_password", { _group_id: data.id, _password: groupPassword.trim() });
      if (pwErr) toast.error(`Group created, but the room key failed: ${pwErr.message}`);
    }
    setCreating(false); setShowCreate(false);
    setName(""); setSubject(""); setDescription(""); setGroupPassword("");
    toast.success("Group created");
    load();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Users className="text-primary" /> Study Groups</h1>
          <p className="text-muted-foreground mt-1">Education-focused chats. Every room is private — invite friends &amp; family with a link and a room key.</p>
        </div>
        {!inChild && me && (
          <Button onClick={() => setShowCreate((v) => !v)} size="sm">
            {showCreate ? <><X className="size-4" /> Cancel</> : <><Plus className="size-4" /> New group</>}
          </Button>
        )}
        {!inChild && !me && (
          <Button asChild size="sm" variant="outline">
            <Link to="/auth">Sign in to create groups</Link>
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
          <div className="space-y-1">
            <Label>Room key (optional, min 4 characters)</Label>
            <Input type="password" value={groupPassword} onChange={(e) => setGroupPassword(e.target.value)}
              placeholder="Sent along with your invite link" maxLength={64} autoComplete="new-password" />
            <p className="text-xs text-muted-foreground">
              Every room is private. Anyone opening your invite link must type this key to join, and you can change it any time from inside the group.
            </p>
          </div>
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