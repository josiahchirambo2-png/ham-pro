import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { EMPTY_WORKSPACE, type Workspace } from "@/lib/aftergrad/workspace";
import { toast } from "sonner";

const cacheKey = (id: string) => `kitai_aftergrad_shortlist_${id}`;

export function useWorkspace() {
  const navigate = useNavigate();
  const [account, setAccount] = useState<string | null | undefined>(undefined);
  const [workspace, setWorkspace] = useState<Workspace>(EMPTY_WORKSPACE);
  const [loading, setLoading] = useState(true);
  const [readFailed, setReadFailed] = useState(false);
  const [pending, setPending] = useState(false);
  const [revision, setRevision] = useState(0);
  const currentAccount = useRef<string | null | undefined>(undefined);
  const lock = useRef(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      const id = session?.user.id ?? null;
      if (event === "SIGNED_OUT" && currentAccount.current) {
        try { localStorage.removeItem(cacheKey(currentAccount.current)); } catch { /* storage unavailable */ }
      }
      currentAccount.current = id;
      setAccount(id);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let live = true;
    if (account === undefined) return;
    setWorkspace(EMPTY_WORKSPACE);
    setReadFailed(false);
    if (!account) { setLoading(false); return; }
    setLoading(true);
    const load = async () => {
      const { data, error } = await supabase.from("aftergrad_workspaces").select("workspace").eq("user_id", account).maybeSingle();
      if (!live) return;
      const stored = data?.workspace as Partial<Workspace> | undefined;
      let saved: string[] = [];
      try {
        if (error) saved = JSON.parse(localStorage.getItem(cacheKey(account)) ?? "[]");
        else localStorage.setItem(cacheKey(account), JSON.stringify(stored?.saved ?? []));
      } catch { /* storage unavailable */ }
      setWorkspace(error ? { ...EMPTY_WORKSPACE, saved } : {
        ...EMPTY_WORKSPACE, ...stored,
        profile: { ...EMPTY_WORKSPACE.profile, ...stored?.profile },
        costs: { ...EMPTY_WORKSPACE.costs, ...stored?.costs },
      });
      setReadFailed(Boolean(error));
      setLoading(false);
    };
    void load();
    const reconnect = () => setRevision((v) => v + 1);
    window.addEventListener("online", reconnect);
    return () => { live = false; window.removeEventListener("online", reconnect); };
  }, [account, revision]);

  function requireAccount() {
    if (account === undefined) { toast.info("Checking your sign-in…"); return false; }
    if (account) return true;
    sessionStorage.setItem("post_auth_redirect", "/after-graduation");
    void navigate({ to: "/auth" });
    return false;
  }

  async function save(patch: Partial<Workspace>) {
    if (!requireAccount() || !account || lock.current) return false;
    if (loading || readFailed) { toast.error("Reconnect and reload your planner before saving."); return false; }
    const updated = { ...workspace, ...patch };
    lock.current = true;
    setPending(true);
    try {
      const { error } = await supabase.from("aftergrad_workspaces").upsert({ user_id: account, workspace: updated as unknown as Json });
      if (error) { toast.error("Could not save your changes. Please try again online."); return false; }
      if (currentAccount.current !== account) return false;
      setWorkspace(updated);
      try { localStorage.setItem(cacheKey(account), JSON.stringify(updated.saved)); } catch { /* storage unavailable */ }
      return true;
    } finally {
      lock.current = false;
      setPending(false);
    }
  }
  return { account, workspace, save, requireAccount, pending: pending || loading, readFailed };
}
