// Guarded service-worker registration. Never runs in dev, Lovable preview,
// iframes, or when ?sw=off is present. Provides a kill-switch by unregistering
// any existing /sw.js if we land in a disallowed context.

function shouldRegister(): boolean {
  if (typeof window === "undefined") return false;
  if (!("serviceWorker" in navigator)) return false;
  if (!import.meta.env.PROD) return false;
  try {
    if (window.self !== window.top) return false;
  } catch {
    return false;
  }
  const url = new URL(window.location.href);
  if (url.searchParams.get("sw") === "off") return false;
  const host = window.location.hostname;
  const bad =
    host.startsWith("id-preview--") ||
    host.startsWith("preview--") ||
    host === "lovableproject.com" ||
    host.endsWith(".lovableproject.com") ||
    host === "lovableproject-dev.com" ||
    host.endsWith(".lovableproject-dev.com") ||
    host === "beta.lovable.dev" ||
    host.endsWith(".beta.lovable.dev");
  return !bad;
}

async function unregisterExisting() {
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      regs
        .filter((r) => (r.active?.scriptURL || "").includes("/sw.js"))
        .map((r) => r.unregister()),
    );
  } catch {
    /* noop */
  }
}

export async function registerHamProSW() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  if (!shouldRegister()) {
    await unregisterExisting();
    return;
  }
  try {
    const { Workbox } = await import("workbox-window");
    const wb = new Workbox("/sw.js");
    wb.addEventListener("waiting", () => wb.messageSkipWaiting());
    await wb.register();
  } catch (err) {
    console.warn("[KIT AI] SW registration failed", err);
  }
}