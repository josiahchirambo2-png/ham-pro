// Client-side appearance store: colour scheme + selected course + learning level.
export type Scheme = "light" | "dark" | "system";

const SCHEME_KEY = "hampro_scheme";
const COURSE_KEY = "hampro_course";
const LEVEL_KEY = "hampro_level";

export function getScheme(): Scheme {
  if (typeof localStorage === "undefined") return "light";
  const v = localStorage.getItem(SCHEME_KEY);
  return v === "dark" || v === "system" || v === "light" ? v : "light";
}

export function getCourseId(): string {
  if (typeof localStorage === "undefined") return "general";
  return localStorage.getItem(COURSE_KEY) || "general";
}

export function getLevelText(): string {
  if (typeof localStorage === "undefined") return "";
  return localStorage.getItem(LEVEL_KEY) || "";
}

export function applyAppearance(scheme: Scheme, courseId: string) {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  const prefersDark =
    typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = scheme === "dark" || (scheme === "system" && prefersDark);
  html.classList.toggle("dark", dark);
  Array.from(html.classList)
    .filter((c) => c.startsWith("course-"))
    .forEach((c) => html.classList.remove(c));
  html.classList.add(`course-${courseId}`);
}

export function saveScheme(scheme: Scheme) {
  try { localStorage.setItem(SCHEME_KEY, scheme); } catch { /* storage blocked */ }
  applyAppearance(scheme, getCourseId());
  dispatch();
}

export function saveCourse(courseId: string) {
  try { localStorage.setItem(COURSE_KEY, courseId); } catch { /* storage blocked */ }
  applyAppearance(getScheme(), courseId);
  dispatch();
}

export function saveLevelText(level: string) {
  try { localStorage.setItem(LEVEL_KEY, level || ""); } catch { /* storage blocked */ }
  dispatch();
}

export const APPEARANCE_EVENT = "hampro:appearance";
function dispatch() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(APPEARANCE_EVENT));
}