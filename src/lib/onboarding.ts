export const ONBOARDED_KEY = "hampro_onboarded_v1";

export function isOnboarded(): boolean {
  if (typeof window === "undefined") return true;
  try { return !!localStorage.getItem(ONBOARDED_KEY); } catch { return true; }
}

export function markOnboarded(answers: unknown) {
  try { localStorage.setItem(ONBOARDED_KEY, JSON.stringify({ at: Date.now(), answers })); } catch { /* ignore */ }
}
