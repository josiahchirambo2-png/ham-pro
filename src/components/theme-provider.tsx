import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AppTheme = "nature" | "graphic" | "space" | "custom";

const THEME_KEY = "hampro_theme";

function levelToTheme(level: string | null | undefined): AppTheme {
  if (!level) return "nature";
  const l = level.toLowerCase();
  // University
  if (/(univ|college|tertiary|year\s*[1-6]|under?grad|post\s*grad|masters?|phd)/.test(l)) return "custom";
  // Try to parse a grade/age number
  const num = parseInt(l.replace(/[^0-9]/g, ""), 10);
  if (!Number.isNaN(num)) {
    // Grade numbers
    if (num <= 7) return "graphic";
    if (num <= 12) return "space";
  }
  if (/(primary|kinder|grade\s*[1-7]\b|under\s*1[23]|elementary)/.test(l)) return "graphic";
  if (/(secondary|high\s*school|junior|senior|gcse|igcse|a-?level|ib|year\s*[7-9]|year\s*1[0-3])/.test(l)) return "space";
  return "nature";
}

function apply(theme: AppTheme) {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  html.classList.remove("theme-nature", "theme-graphic", "theme-space", "theme-custom");
  html.classList.add(`theme-${theme}`);
  try { localStorage.setItem(THEME_KEY, theme); } catch {}
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [, setTheme] = useState<AppTheme>("nature");

  useEffect(() => {
    // Apply cached theme immediately to avoid flash
    try {
      const cached = (localStorage.getItem(THEME_KEY) as AppTheme | null) ?? "nature";
      apply(cached);
      setTheme(cached);
    } catch { apply("nature"); }

    let mounted = true;
    async function refresh() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !mounted) return;
      const { data: p } = await supabase.from("profiles").select("education_level").eq("id", user.id).maybeSingle();
      const t = levelToTheme(p?.education_level ?? null);
      if (mounted) { apply(t); setTheme(t); }
    }
    refresh();

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "USER_UPDATED") refresh();
      if (event === "SIGNED_OUT") { apply("nature"); setTheme("nature"); }
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  return <>{children}</>;
}

export function setThemeFromLevel(level: string | null | undefined) {
  apply(levelToTheme(level));
}