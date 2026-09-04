import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Pencil, Check, X, UserPlus, Lock, Link2, KeyRound, ShieldCheck } from "lucide-react";
import { moderateMessage } from "@/lib/moderation";
import {
  deriveRoomKey, encryptMessage, decryptMessage, isEncrypted,
  getStoredRoomKey, storeRoomKey, clearRoomKey,
} from "@/lib/roomkey";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/community/$groupId")({
  head: () => ({ meta: [{ title: "Group chat — KIT AI" }] }),
  component: GroupChat,
});

type Msg = { id: string; user_id: string; content: string; created_at: string; edited_at: string | null };
type Group = { id: string; name: string; is_private: boolean; created_by: string | null; invite_token: string | null };

function GroupChat() {
  const { groupId } = Route.useParams();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [plain, setPlain] = useState<Record<string, string>>({});
  const [names, setNames] = useState<Record<string, string | null>>({});
  const [text, setText] = useState("");
  const [me, setMe] = useState<string | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [savingPw, setSavingPw] = useState(false);
  const [hasPw, setHasPw] = useState(false);
  const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null);
  const [unlockInput, setUnlockInput] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { supabase.auth.getUser().then(({ data }) => setMe(data.user?.id ?? null)); }, []);

  useEffect(() => {
    supabase.from("study_groups").select("id,name,is_private,created_by,invite_token").eq("id", groupId).maybeSingle()
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

  // Does this room have a key, and do we already hold it on this device?
  useEffect(() => {
    let active = true;
    (supabase as any).rpc("group_has_password", { _group_id: groupId })
      .then(async ({ data }: { data: boolean | null }) => {
        if (!active) return;
        setHasPw(!!data);
        const stored = getStoredRoomKey(groupId);
        if (stored) setCryptoKey(await deriveRoomKey(stored, groupId));
      });
    return () => { active = false; };
  }, [groupId]);

  // Decrypt whatever we can, whenever messages or the key change.
  useEffect(() => {
    let active = true;
    (async () => {
      const next: Record<string, string> = {};
      for (const m of msgs) {
        next[m.id] = await decryptMessage(m.content, cryptoKey);
      }
      if (active) setPlain(next);
    })();
    return () => { active = false; };
  }, [msgs, cryptoKey]);

  // Member display names come from a guarded same-room lookup, never the profiles table.
  useEffect(() => {
    (supabase as any).rpc("group_member_names", { _group_id: groupId }).then(({ data }: { data: any[] | null }) => {
      const next: Record<string, string | null> = {};
      (data ?? []).forEach((p) => { next[p.id] = p.display_name; });
      setNames(next);
    });
  }, [groupId, msgs.length]);

  useEffect(() => { if (!editingId) endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, editingId]);

  const locked = hasPw && !cryptoKey;

  const seal = useCallback(async (content: string) => {
    if (cryptoKey) return encryptMessage(content, cryptoKey);
    return content;
  }, [cryptoKey]);

  async function unlock(e: React.FormEvent) {
    e.preventDefault();
    const key = unlockInput.trim();
    if (!key) return;
    setUnlocking(true);
    const { data, error } = await (supabase as any).rpc("verify_group_key", { _group_id: groupId, _password: key });
    setUnlocking(false);
    if (error) { toast.error(error.message); return; }
    if (!data) { toast.error("Wrong room key"); return; }
    storeRoomKey(groupId, key);
    setCryptoKey(await deriveRoomKey(key, groupId));
    setUnlockInput("");
    toast.success("Room unlocked — messages decrypted on this device");
  }

  function forgetKey() {
    clearRoomKey(groupId);
    setCryptoKey(null);
    toast.message("Room key removed from this device");
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !me || locked) return;
    const content = text.trim();
    const check = moderateMessage(content);
    if (!check.ok) { toast.error(check.reason); return; }
    setText("");
    const payload = await seal(content);
    const { error } = await supabase.from("group_messages").insert({ group_id: groupId, user_id: me, content: payload });
    if (error) toast.error(error.message);
  }

  function startEdit(m: Msg) { setEditingId(m.id); setEditText(plain[m.id] ?? ""); }
  function cancelEdit() { setEditingId(null); setEditText(""); }

  async function saveEdit(id: string) {
    const content = editText.trim();
    if (!content) return;
    const check = moderateMessage(content);
    if (!check.ok) { toast.error(check.reason); return; }
    const payload = await seal(content);
    const { error } = await supabase.from("group_messages")
      .update({ content: payload, edited_at: new Date().toISOString() })
      .eq("id", id);
    if (error) { toast.error(error.message); return; }
    cancelEdit();
  }

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    const name = inviteEmail.trim();
    if (!name || !me) return;
    setInviting(true);
    const { data, error: findErr } = await (supabase as any).rpc("find_user_by_display_name", { _display_name: name });
    let targetId: string | null = Array.isArray(data) ? (data[0]?.id ?? null) : (data as string | null);
    if (findErr) targetId = null;
    if (!targetId) { setInviting(false); toast.error("No KIT AI user found with that name. Ask them for the exact display name on their profile."); return; }
    const { error } = await supabase.from("group_members").insert({ group_id: groupId, user_id: targetId, added_by: me });
    setInviting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Invited to the group");
    setInviteEmail(""); setShowInvite(false);
  }

  const isOwner = !!group && !!me && group.created_by === me;

  async function saveRoomKey(e: React.FormEvent) {
    e.preventDefault();
    const pw = newPw.trim();
    if (pw && pw.length < 4) { toast.error("Room key must be at least 4 characters"); return; }
    setSavingPw(true);
    const { error } = await (supabase as any).rpc("set_group_password", { _group_id: groupId, _password: pw || null });
    setSavingPw(false);
    if (error) { toast.error(error.message); return; }
    setHasPw(!!pw);
    if (pw) {
      storeRoomKey(groupId, pw);
      setCryptoKey(await deriveRoomKey(pw, groupId));
    } else {
      clearRoomKey(groupId);
      setCryptoKey(null);
    }
    setNewPw(""); setShowPw(false);
    toast.success(pw
      ? "Room key updated — new messages are encrypted with it. Share it with your invite link."
      : "Room key removed — new messages will not be encrypted");
  }

  async function copyInviteLink(token: string) {
    const url = `${window.location.origin}/join/${token}`;
    const body = hasPw
      ? `Join my KIT AI study group: ${url}\nRoom key: (send it separately — it decrypts the chat)`
      : url;
    try {
      await navigator.clipboard.writeText(body);
      toast.success(hasPw ? "Invite copied — remember to send the room key too" : "Invite link copied");
    } catch {
      toast.message("Invite link", { description: url });
    }
  }

  return (
    <div className="mt-6 rounded-2xl border bg-card flex flex-col" style={{ height: "calc(100dvh - 200px)" }}>
      <div className="border-b p-3 flex items-center gap-2 flex-wrap">
        <Button asChild size="sm" variant="ghost"><Link to="/community"><ArrowLeft className="size-4" /> Back</Link></Button>
        {group && (
          <div className="flex items-center gap-2 text-sm font-medium">
            {group.is_private && <Lock className="size-3 text-primary" />} {group.name}
          </div>
        )}
        {cryptoKey && (
          <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
            <ShieldCheck className="size-3 text-primary" /> End-to-end encrypted
          </span>
        )}
        <div className="ml-auto">
          <div className="flex items-center gap-2">
            {cryptoKey && (
              <Button size="sm" variant="ghost" onClick={forgetKey}>Forget key</Button>
            )}
            {isOwner && group?.invite_token && (
              <Button size="sm" variant="outline" onClick={() => copyInviteLink(group.invite_token!)}>
                <Link2 className="size-4" /> Copy invite link
              </Button>
            )}
            {isOwner && (
              <Button size="sm" variant="outline" onClick={() => setShowInvite((v) => !v)}>
                <UserPlus className="size-4" /> Invite by name
              </Button>
            )}
            {isOwner && (
              <Button size="sm" variant="outline" onClick={() => setShowPw((v) => !v)}>
                <KeyRound className="size-4" /> {hasPw ? "Change room key" : "Set room key"}
              </Button>
            )}
          </div>
        </div>
      </div>
      {showPw && isOwner && (
        <form onSubmit={saveRoomKey} className="border-b p-3 flex flex-wrap gap-2 items-center bg-muted/30">
          <Input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} autoComplete="new-password"
            placeholder={hasPw ? "New room key (leave blank to remove)" : "New room key (min 4 characters)"} className="flex-1 min-w-48" maxLength={64} />
          <Button type="submit" size="sm" disabled={savingPw}>{savingPw ? "Saving…" : "Save"}</Button>
          <p className="w-full text-xs text-muted-foreground">
            The key never leaves your device — it both unlocks the room and encrypts every message. Messages sent under an older key stay readable only with that older key.
          </p>
        </form>
      )}
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
          const body = plain[m.id] ?? (isEncrypted(m.content) ? "Locked" : m.content);
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`group max-w-[75%] rounded-2xl px-3 py-2 ${mine ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-secondary text-secondary-foreground rounded-tl-sm"}`}>
                {!mine && <p className="text-[10px] font-semibold opacity-70 mb-0.5">{names[m.user_id] ?? "Learner"}</p>}
                {editing ? (
                  <div className="flex items-center gap-1">
                    <Input value={editText} onChange={(e) => setEditText(e.target.value)} className="h-8 text-sm bg-background text-foreground" autoFocus
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); saveEdit(m.id); } if (e.key === "Escape") cancelEdit(); }} />
                    <Button size="icon" variant="ghost" className="size-7" onClick={() => saveEdit(m.id)}><Check className="size-4" /></Button>
                    <Button size="icon" variant="ghost" className="size-7" onClick={cancelEdit}><X className="size-4" /></Button>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{body}</p>
                )}
                <div className="flex items-center gap-2 mt-0.5">
                  {m.edited_at && !editing && <span className="text-[10px] opacity-60">edited</span>}
                  {mine && !editing && !locked && (
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
      {!me ? (
        <div className="border-t p-3 flex items-center justify-between text-sm bg-muted/30">
          <span className="text-muted-foreground">Sign in to post in this group.</span>
          <Button asChild size="sm"><Link to="/auth">Sign in</Link></Button>
        </div>
      ) : locked ? (
        <form onSubmit={unlock} className="border-t p-3 flex flex-wrap gap-2 items-center bg-muted/30">
          <Input type="password" value={unlockInput} onChange={(e) => setUnlockInput(e.target.value)} autoComplete="off"
            placeholder="Enter the room key to read and post" className="flex-1 min-w-48" maxLength={64} />
          <Button type="submit" size="sm" disabled={unlocking || !unlockInput.trim()}>
            <KeyRound className="size-4" /> {unlocking ? "Checking…" : "Unlock"}
          </Button>
          <p className="w-full text-xs text-muted-foreground">This chat is end-to-end encrypted. The key was sent with your invite and stays on this device.</p>
        </form>
      ) : (
        <form onSubmit={send} className="border-t p-3 flex gap-2">
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask a study question…" maxLength={1000} />
          <Button type="submit" size="icon" disabled={!text.trim()}><Send className="size-4" /></Button>
        </form>
      )}
    </div>
  );
}
