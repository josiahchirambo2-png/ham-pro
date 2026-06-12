import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send } from "lucide-react";

export const Route = createFileRoute("/_authenticated/community/$groupId")({
  head: () => ({ meta: [{ title: "Group chat — HAM PRO" }] }),
  component: GroupChat,
});

type Msg = { id: string; user_id: string; content: string; created_at: string };

function GroupChat() {
  const { groupId } = Route.useParams();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [profiles, setProfiles] = useState<Record<string, { display_name: string | null }>>({});
  const [text, setText] = useState("");
  const [me, setMe] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { supabase.auth.getUser().then(({ data }) => setMe(data.user?.id ?? null)); }, []);

  useEffect(() => {
    supabase.from("group_messages").select("*").eq("group_id", groupId).order("created_at", { ascending: true }).limit(200)
      .then(({ data }) => setMsgs((data as Msg[]) ?? []));
    const ch = supabase.channel(`g:${groupId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "group_messages", filter: `group_id=eq.${groupId}` },
        (p) => setMsgs((m) => [...m, p.new as Msg]))
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

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !me) return;
    const content = text.trim(); setText("");
    await supabase.from("group_messages").insert({ group_id: groupId, user_id: me, content });
  }

  return (
    <div className="mt-6 rounded-2xl border bg-card flex flex-col" style={{ height: "calc(100dvh - 200px)" }}>
      <div className="border-b p-3 flex items-center gap-2">
        <Button asChild size="sm" variant="ghost"><Link to="/community"><ArrowLeft className="size-4" /> Back</Link></Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {msgs.map((m) => {
          const mine = m.user_id === me;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-3 py-2 ${mine ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-secondary text-secondary-foreground rounded-tl-sm"}`}>
                {!mine && <p className="text-[10px] font-semibold opacity-70 mb-0.5">{profiles[m.user_id]?.display_name ?? "Learner"}</p>}
                <p className="text-sm whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <form onSubmit={send} className="border-t p-3 flex gap-2">
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Message the group…" />
        <Button type="submit" size="icon" disabled={!text.trim()}><Send className="size-4" /></Button>
      </form>
    </div>
  );
}