import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Download } from "lucide-react";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

const DISMISS_KEY = "hampro_install_dismissed_at";
const DISMISS_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const onBefore = (e: Event) => {
      e.preventDefault();
      const evt = e as BIPEvent;
      setDeferred(evt);

      const dismissed = Number(localStorage.getItem(DISMISS_KEY) || 0);
      if (Date.now() - dismissed < DISMISS_MS) return;

      toast("Install HAM PRO", {
        description: "Add HAM PRO to your device for a faster, app-like experience.",
        duration: 12000,
        action: {
          label: "Install",
          onClick: async () => {
            await evt.prompt();
            await evt.userChoice;
            setDeferred(null);
          },
        },
        onDismiss: () => localStorage.setItem(DISMISS_KEY, String(Date.now())),
        onAutoClose: () => localStorage.setItem(DISMISS_KEY, String(Date.now())),
      });
    };

    const onInstalled = () => {
      setDeferred(null);
      toast.success("HAM PRO installed", { description: "Launch it from your home screen anytime." });
    };

    window.addEventListener("beforeinstallprompt", onBefore);
    window.addEventListener("appinstalled", onInstalled);

    // iOS Safari has no beforeinstallprompt — show a one-time hint
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    const inStandalone = (navigator as unknown as { standalone?: boolean }).standalone;
    if (isIOS && !inStandalone) {
      const dismissed = Number(localStorage.getItem(DISMISS_KEY) || 0);
      if (Date.now() - dismissed > DISMISS_MS) {
        setTimeout(() => {
          toast("Install HAM PRO on your iPhone", {
            description: "Tap the Share icon, then 'Add to Home Screen'.",
            duration: 12000,
            onDismiss: () => localStorage.setItem(DISMISS_KEY, String(Date.now())),
            onAutoClose: () => localStorage.setItem(DISMISS_KEY, String(Date.now())),
          });
        }, 2500);
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBefore);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!deferred) return null;

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={async () => {
        await deferred.prompt();
        await deferred.userChoice;
        setDeferred(null);
      }}
      className="gap-1.5"
    >
      <Download className="size-4" /> Install app
    </Button>
  );
}