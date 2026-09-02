import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { supabase } from "@/integrations/supabase/client";
import { isOnboarded, markOnboarded } from "@/lib/onboarding";

export const Route = createFileRoute("/_app")({
  ssr: false,
  beforeLoad: async () => {
    if (isOnboarded()) return;
    // Returning users who already answered on another device shouldn't be asked again.
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      const { data: p } = await supabase.from("profiles").select("onboarded_at").eq("id", data.user.id).maybeSingle();
      if (p && (p as { onboarded_at?: string | null }).onboarded_at) {
        markOnboarded(null);
        return;
      }
    }
    throw redirect({ to: "/onboarding" });
  },
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
