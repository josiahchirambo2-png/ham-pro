import { useEffect, useState } from "react";
import { useNavigate, useRouterState, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { fetchSubscription, isAdmin } from "@/lib/subscription";
import { Button } from "./ui/button";
import { Lock, Loader2 } from "lucide-react";

const ALLOWED = ["/subscription", "/profile", "/admin"];

export function AccessGate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [state, setState] = useState<"loading" | "ok" | "locked" | "anon">("loading");

  async function check() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return setState("anon");
    const [sub, admin] = await Promise.all([fetchSubscription(), isAdmin()]);
    setState(admin || sub?.hasAccess ? "ok" : "locked");
  }

  useEffect(() => {
    check();
    const { data: sub } = supabase.auth.onAuthStateChange(() => { check(); });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (state === "anon") navigate({ to: "/auth", replace: true });
    if (state === "locked" && !ALLOWED.includes(pathname)) navigate({ to: "/subscription", replace: true });
  }, [state, pathname]);

  if (state === "loading") {
    return (
      <div className="min-h-[60vh] grid place-items-center text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  if (state === "anon") return null;

  if (state === "locked" && !ALLOWED.includes(pathname)) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <Lock className="mx-auto size-8 text-primary" />
        <h1 className="mt-4 text-2xl font-bold">Subscription required</h1>
        <p className="mt-2 text-sm text-muted-foreground">Your free trial has ended. Subscribe to unlock HAM PRO again.</p>
        <Button asChild className="mt-5"><Link to="/subscription">Go to subscription</Link></Button>
      </div>
    );
  }

  return <>{children}</>;
}