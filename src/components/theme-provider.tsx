import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { applyAppearance, getCourseId, getScheme, saveLevelText } from "@/lib/appearance";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    applyAppearance(getScheme(), getCourseId());

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => {
      if (getScheme() === "system") applyAppearance("system", getCourseId());
    };
    mq.addEventListener("change", onSystemChange);

    let mounted = true;
    async function refreshLevel() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !mounted) return;
      const { data: p } = await supabase
        .from("profiles").select("education_level").eq("id", user.id).maybeSingle();
      if (mounted) saveLevelText(p?.education_level ?? "");
    }
    refreshLevel();

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "USER_UPDATED") refreshLevel();
      if (event === "SIGNED_OUT") saveLevelText("");
    });
    return () => {
      mounted = false;
      mq.removeEventListener("change", onSystemChange);
      sub.subscription.unsubscribe();
    };
  }, []);

  return <>{children}</>;
}

// Kept for the profile page: level now drives the mascots, not the palette.
export function setThemeFromLevel(level: string | null | undefined) {
  saveLevelText(level ?? "");
}