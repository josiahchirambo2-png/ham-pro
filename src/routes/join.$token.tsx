import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { Lock, Users, Loader2, LogIn, KeyRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/join/$token")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Join study group — HAM PRO" },
      { name: "description", content: "You've been invited to a HAM PRO study group." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: JoinPage,
});

type GroupPreview = { id: string; name: string; description: string | null; subject: string | null; is_private: boolean; requires_password?: boolean };

function JoinPage() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState<GroupPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [joining, setJoining] = useState(false);
  const [password, setPassword] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let cancelled = false;
    supabase.rpc("get_group_by_invite", { _token: token }).then(({ data, error }) => {
      if (cancelled) return;
      if (error || !data || (Array.isArray(data) && data.length === 0)) {
        setNotFound(true);
      } else {
        const row = Array.isArray(data) ? data[0] : data;
        setGroup(row as GroupPreview);
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [token]);

  async function accept() {
    if (!signedIn) {
      sessionStorage.setItem("post_auth_redirect", `/join/${token}`);
      navigate({ to: "/auth" });
      return;
    }
    if (group?.requires_password && !password.trim()) { toast.error("This group needs the password from your invite"); return; }
    setJoining(true);
    const { data, error } = await (supabase as any).rpc("join_group_by_invite", { _token: token, _password: password.trim() || null });
    setJoining(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Joined ${group?.name ?? "the group"}`);
    navigate({ to: "/community/$groupId", params: { groupId: data as string } });
  }

  return (
    <div className="min-h-dvh grid place-items-center px-4 py-10" style={{ background: "var(--gradient-canopy)" }}>
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-leaf)]">
        <div className="flex justify-center"><Logo /></div>
        {loading && (
          <div className="mt-8 flex items-center justify-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="size-4 animate-spin" /> Loading invite…
          </div>
        )}
        {!loading && notFound && (
          <div className="mt-6 text-center">
            <h1 className="text-xl font-semibold">Invite not valid</h1>
            <p className="mt-2 text-sm text-muted-foreground">This link has expired or was revoked. Ask the group owner for a fresh one.</p>
            <Button asChild className="mt-6"><Link to="/community">Back to Study Groups</Link></Button>
          </div>
        )}
        {!loading && group && (
          <div className="mt-6 text-center">
            <div className="mx-auto size-14 rounded-2xl grid place-items-center text-primary-foreground" style={{ background: "var(--gradient-leaf)" }}>
              <Users className="size-6" />
            </div>
            <p className="mt-4 text-xs uppercase tracking-wide text-muted-foreground">You're invited to join</p>
            <h1 className="mt-1 text-2xl font-bold flex items-center justify-center gap-2">
              {group.is_private && <Lock className="size-4 text-primary" />} {group.name}
            </h1>
            {group.subject && <p className="mt-1 text-sm text-muted-foreground">{group.subject}</p>}
            {group.description && <p className="mt-3 text-sm">{group.description}</p>}
            {group.requires_password && (
              <div className="mt-5 text-left">
                <label className="text-xs flex items-center gap-1.5 text-muted-foreground">
                  <KeyRound className="size-3.5" /> Group password
                </label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="off"
                  className="mt-1" placeholder="Sent with your invite" maxLength={64}
                  onKeyDown={(e) => { if (e.key === "Enter") accept(); }} />
              </div>
            )}
            <Button className="mt-6 w-full" size="lg" onClick={accept} disabled={joining}>
              {joining ? <><Loader2 className="size-4 animate-spin" /> Joining…</>
                : signedIn ? <>Accept invite &amp; open chat</>
                : <><LogIn className="size-4" /> Sign in to join</>}
            </Button>
            {!signedIn && (
              <p className="mt-3 text-[11px] text-muted-foreground">You'll be brought straight back here after signing in.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}