import { useEffect, useState } from "react";
import { useRouterState, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { fetchSubscription, isAdmin } from "@/lib/subscription";
import { Button } from "./ui/button";
import { Crown, Loader2 } from "lucide-react";

// Only these areas require an active premium subscription. Everything else is free.
const PREMIUM_PATHS = ["/hamiverse", "/visualize", "/community", "/schedule", "/progress"];

const isPremiumPath = (p: string) => PREMIUM_PATHS.some((x) => p === x || p.startsWith(x + "/"));

export function AccessGate({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [state, setState] = useState<"loading" | "ok" | "locked" | "anon">("loading");

  async function check() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return setState("anon");
    // Admins always get full access — never gate them behind a subscription.
    let admin = false;
    try { admin = await isAdmin(); } catch { admin = false; }
    if (admin) return setState("ok");
    let sub = null;
    try { sub = await fetchSubscription(); } catch { sub = null; }
    setState(sub?.hasAccess ? "ok" : "locked");
  }

  useEffect(() => {
    check();
    const { data: sub } = supabase.auth.onAuthStateChange(() => { check(); });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Free areas render immediately, signed in or not.
  if (!isPremiumPath(pathname)) return <>{children}</>;

  if (state === "loading") {
    return (
      <div className="min-h-[60vh] grid place-items-center text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  if (state === "anon" || state === "locked") {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <Crown className="mx-auto size-8 text-primary" />
        <h1 className="mt-4 text-2xl font-bold">Premium feature</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          HAMIVERSE, AI Visuals, Study Groups, Schedule and Progress are premium. The rest of HAM PRO stays free.
        </p>
        {state === "anon" ? (
          <Button asChild className="mt-5"><Link to="/auth">Sign in to continue</Link></Button>
        ) : (
          <Button asChild className="mt-5"><Link to="/subscription">Go to Premium</Link></Button>
        )}
      </div>
    );
  }

  return <>{children}</>;
}