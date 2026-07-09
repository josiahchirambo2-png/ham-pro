import { supabase } from "@/integrations/supabase/client";

export type SubStatus = { hasAccess: boolean; status: string; trialEndsAt: string | null; currentPeriodEnd: string | null; adminBypass: boolean };

export async function fetchSubscription(): Promise<SubStatus | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await (supabase as any).from("subscriptions").select("*").eq("user_id", user.id).maybeSingle();
  if (!data) return { hasAccess: false, status: "none", trialEndsAt: null, currentPeriodEnd: null, adminBypass: false };
  const now = Date.now();
  const trialOk = data.trial_ends_at && new Date(data.trial_ends_at).getTime() > now;
  const periodOk = data.current_period_end && new Date(data.current_period_end).getTime() > now;
  return {
    hasAccess: !!(data.admin_bypass || trialOk || periodOk),
    status: data.status,
    trialEndsAt: data.trial_ends_at,
    currentPeriodEnd: data.current_period_end,
    adminBypass: !!data.admin_bypass,
  };
}

export async function isAdmin(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await (supabase as any).from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
  return !!data;
}