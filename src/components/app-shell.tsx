import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Logo } from "./logo";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { LogIn, LogOut, Menu, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { APPEARANCE_EVENT, getCourseId } from "@/lib/appearance";
import { courseById } from "@/lib/courses";

const NAV = [
  { to: "/dashboard", label: "Home" },
  { to: "/courses", label: "Courses" },
  { to: "/tutor", label: "HAM Tutor" },
  { to: "/identify", label: "Identify" },
  { to: "/notes", label: "Notes" },
  { to: "/tests", label: "Tests" },
  { to: "/labs", label: "Labs" },
  { to: "/hamiverse", label: "HAMIVERSE" },
  { to: "/visualize", label: "AI Visuals" },
  { to: "/community", label: "Study Groups" },
  { to: "/schedule", label: "Schedule" },
  { to: "/progress", label: "Progress" },
  { to: "/appearance", label: "Scheme" },
  { to: "/profile", label: "Profile" },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean>(false);
  const [courseId, setCourseId] = useState("general");

  useEffect(() => {
    const read = () => setCourseId(getCourseId());
    read();
    window.addEventListener(APPEARANCE_EVENT, read);
    return () => window.removeEventListener(APPEARANCE_EVENT, read);
  }, []);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSignedIn(!!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(!!session);
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-dvh flex flex-col bg-background az-grid-bg">
      <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between gap-4">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <span className="az-dot" aria-hidden="true" />
            <Logo />
            {courseId !== "general" && (
              <span className="az-eyebrow hidden sm:inline rounded-full border border-border px-2.5 py-0.5 text-muted-foreground">
                {(() => { const C = courseById(courseId).icon; return <C className="size-3 inline-block mr-1 -mt-0.5" aria-hidden="true" />; })()}
                {courseById(courseId).name}
              </span>
            )}
          </Link>
          <nav className="hidden lg:flex items-center gap-0.5 overflow-x-auto no-scrollbar max-w-[62vw]">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="px-2.5 py-1.5 rounded-full text-[12px] tracking-wide uppercase whitespace-nowrap font-medium text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors"
                activeProps={{ className: "px-2.5 py-1.5 rounded-full text-[12px] tracking-wide uppercase whitespace-nowrap font-semibold text-primary bg-accent/40 az-glow-ring" }}
              >
                {n.label}
              </Link>
            ))}
            <a href="https://brand-bios-showcase.lovable.app" target="_blank" rel="noopener noreferrer"
              className="px-2.5 py-1.5 rounded-full text-[12px] tracking-wide uppercase whitespace-nowrap font-medium text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors">
              About the Developer
            </a>
          </nav>
          <div className="flex items-center gap-2">
            {signedIn ? (
              <Button size="sm" variant="ghost" onClick={signOut} className="hidden lg:inline-flex">
                <LogOut className="size-4" /> Sign out
              </Button>
            ) : (
              <Button size="sm" variant="default" asChild className="hidden lg:inline-flex">
                <Link to="/auth"><LogIn className="size-4" /> Sign in</Link>
              </Button>
            )}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button size="icon" variant="ghost" className="lg:hidden"><Menu /></Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="mt-8 flex flex-col gap-1">
                  {NAV.map((n) => (
                    <Link
                      key={n.to}
                      to={n.to}
                      className="px-3 py-2.5 rounded-md text-base font-medium text-foreground hover:bg-accent/50"
                      activeProps={{ className: "px-3 py-2.5 rounded-md text-base font-semibold text-primary bg-accent/60" }}
                    >
                      {n.label}
                    </Link>
                  ))}
                  <a href="https://brand-bios-showcase.lovable.app" target="_blank" rel="noopener noreferrer"
                    className="px-3 py-2.5 rounded-md text-base font-medium text-foreground hover:bg-accent/50 inline-flex items-center gap-2">
                    <UserRound className="size-4" /> About the Developer
                  </a>
                  {signedIn ? (
                    <Button variant="outline" className="mt-4" onClick={signOut}>
                      <LogOut className="size-4" /> Sign out
                    </Button>
                  ) : (
                    <Button className="mt-4" asChild>
                      <Link to="/auth"><LogIn className="size-4" /> Sign in</Link>
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border py-5 text-center">
        <p className="az-eyebrow text-muted-foreground/80">HAM PRO © Josiah Brian Chirambo</p>
      </footer>
    </div>
  );
}