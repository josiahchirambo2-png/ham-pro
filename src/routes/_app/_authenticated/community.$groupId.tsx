import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Pencil, Check, X, UserPlus, Lock } from "lucide-react";
import { moderateMessage } from "@/lib/moderation";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/_authenticated/community/$groupId")({
  head: () => ({ meta: [{ title: "Group chat — HAM PRO" }] }),
  component: GroupChat,
});

type Msg = { id: string; user_id: string; content: string; created_at: string; edited_at: string | null };
type Group = { id: string; name: string; is_private: boolean; created_by: string | null };

function GroupChat() {
  const { groupId } = Route.useParams();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [profiles, setProfiles] = useState<Record<string, { display_name: string | null }>>({});
  const [text, setText] = useState("");
  const [me, setMe] = useState<string | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { supabase.auth.getUser().then(({ data }) => setMe(data.user?.id ?? null)); }, []);

  useEffect(() => {
    supabase.from("study_groups").select("id,name,is_private,created_by").eq("id", groupId).maybeSingle()
      .then(({ data }) => setGroup((data as Group) ?? null));
    supabase.from("group_messages").select("*").eq("group_id", groupId).order("created_at", { ascending: true }).limit(200)
      .then(({ data }) => setMsgs((data as Msg[]) ?? []));
    const ch = supabase.channel(`g:${groupId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "group_messages", filter: `group_id=eq.${groupId}` },
        (p) => setMsgs((m) => [...m, p.new as Msg]))
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "group_messages", filter: `group_id=eq.${groupId}` },
        (p) => setMsgs((m) => m.map((x) => x.id === (p.new as Msg).id ? (p.new as Msg) : x)))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [groupId]);

  useEffect(() => {
    const missing = Array.from(new Set(msgs.map((m) => m.user_id))).filter((id) => !profiles[id]);
    if (missing.length === 0) return;
    supabase.from("profiles").select("id,display_name").in("id", missing).then(({ data }) => {
      const next = { ...profiles };
      (data ?? []).forEach((p: any) => { next[p.id] = { display_name: p.display_name }; });
      setProfiles(next);
    });
  }, [msgs, profiles]);

  useEffect(() => { if (!editingId) endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, editingId]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !me) return;
    const content = text.trim();
    const check = moderateMessage(content);
    if (!check.ok) { toast.error(check.reason); return; }
    setText("");
    const { error } = await supabase.from("group_messages").insert({ group_id: groupId, user_id: me, content });
    if (error) toast.error(error.message);
  }

  function startEdit(m: Msg) { setEditingId(m.id); setEditText(m.content); }
  function cancelEdit() { setEditingId(null); setEditText(""); }

  async function saveEdit(id: string) {
    const content = editText.trim();
    if (!content) return;
    const check = moderateMessage(content);
    if (!check.ok) { toast.error(check.reason); return; }
    const { error } = await supabase.from("group_messages")
      .update({ content, edited_at: new Date().toISOString() })
      .eq("id", id);
    if (error) { toast.error(error.message); return; }
    cancelEdit();
  }

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    const email = inviteEmail.trim().toLowerCase();
    if (!email || !me) return;
    setInviting(true);
    const { data: prof } = await supabase.from("profiles").select("id,display_name").ilike("display_name", email).limit(1);
    let targetId: string | null = prof && prof[0] ? (prof[0] as any).id : null;
    // Fallback: try matching against email prefix as display_name
    if (!targetId) {
      const { data: prof2 } = await supabase.from("profiles").select("id,display_name").ilike("display_name", email.split("@")[0]).limit(1);
      targetId = prof2 && prof2[0] ? (prof2[0] as any).id : null;
    }
    if (!targetId) { setInviting(false); toast.error("No HAM PRO user found with that name. Ask them for the exact display name on their profile."); return; }
    const { error } = await supabase.from("group_members").insert({ group_id: groupId, user_id: targetId, added_by: me });
    setInviting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Invited to the group");
    setInviteEmail(""); setShowInvite(false);
  }

  const isOwner = !!group && !!me && group.created_by === me;

  return (
    <div className="mt-6 rounded-2xl border bg-card flex flex-col" style={{ height: "calc(100dvh - 200px)" }}>
      <div className="border-b p-3 flex items-center gap-2 flex-wrap">
        <Button asChild size="sm" variant="ghost"><Link to="/community"><ArrowLeft className="size-4" /> Back</Link></Button>
        {group && (
          <div className="flex items-center gap-2 text-sm font-medium">
            {group.is_private && <Lock className="size-3 text-primary" />} {group.name}
          </div>
        )}
        <div className="ml-auto">
          {group?.is_private && isOwner && (
            <Button size="sm" variant="outline" onClick={() => setShowInvite((v) => !v)}>
              <UserPlus className="size-4" /> Invite
            </Button>
          )}
        </div>
      </div>
      {showInvite && (
        <form onSubmit={invite} className="border-b p-3 flex gap-2 bg-muted/30">
          <Input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="Friend's display name" />
          <Button type="submit" size="sm" disabled={inviting || !inviteEmail.trim()}>{inviting ? "Adding…" : "Add"}</Button>
        </form>
      )}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {msgs.map((m) => {
          const mine = m.user_id === me;
          const editing = editingId === m.id;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`group max-w-[75%] rounded-2xl px-3 py-2 ${mine ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-secondary text-secondary-foreground rounded-tl-sm"}`}>
                {!mine && <p className="text-[10px] font-semibold opacity-70 mb-0.5">{profiles[m.user_id]?.display_name ?? "Learner"}</p>}
                {editing ? (
                  <div className="flex items-center gap-1">
                    <Input value={editText} onChange={(e) => setEditText(e.target.value)} className="h-8 text-sm bg-background text-foreground" autoFocus
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); saveEdit(m.id); } if (e.key === "Escape") cancelEdit(); }} />
                    <Button size="icon" variant="ghost" className="size-7" onClick={() => saveEdit(m.id)}><Check className="size-4" /></Button>
                    <Button size="icon" variant="ghost" className="size-7" onClick={cancelEdit}><X className="size-4" /></Button>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                )}
                <div className="flex items-center gap-2 mt-0.5">
                  {m.edited_at && !editing && <span className="text-[10px] opacity-60">edited</span>}
                  {mine && !editing && (
                    <button onClick={() => startEdit(m)} className="text-[10px] opacity-60 hover:opacity-100 flex items-center gap-0.5 ml-auto">
                      <Pencil className="size-3" /> edit
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <form onSubmit={send} className="border-t p-3 flex gap-2">
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask a study question…" maxLength={1000} />
        <Button type="submit" size="icon" disabled={!text.trim()}><Send className="size-4" /></Button>
      </form>
    </div>
  );
}