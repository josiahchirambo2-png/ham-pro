import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Logo } from "./logo";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { LogIn, LogOut, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { isAdmin as checkAdmin } from "@/lib/subscription";

const NAV = [
  { to: "/dashboard", label: "Home" },
  { to: "/tutor", label: "HAM Tutor" },
  { to: "/identify", label: "Identify" },
  { to: "/notes", label: "Notes" },
  { to: "/syllabus", label: "Syllabus" },
  { to: "/tests", label: "Tests" },
  { to: "/labs", label: "Labs" },
  { to: "/schedule", label: "Schedule" },
  { to: "/community", label: "Study Groups" },
  { to: "/hamiverse", label: "HAMIVERSE" },
  { to: "/subscription", label: "Subscription" },
  { to: "/profile", label: "Profile" },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean>(false);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSignedIn(!!data.session);
      if (data.session) setAdmin(await checkAdmin());
    });
    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, session) => {
      setSignedIn(!!session);
      setAdmin(session ? await checkAdmin() : false);
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
    <div className="min-h-dvh flex flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between gap-4">
          <Link to="/dashboard"><Logo /></Link>
          <nav className="hidden md:flex items-center gap-1 overflow-x-auto">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
                activeProps={{ className: "px-3 py-1.5 rounded-md text-sm font-medium text-primary bg-accent/50" }}
              >
                {n.label}
              </Link>
            ))}
            {admin && (
              <Link to="/admin" className="px-3 py-1.5 rounded-md text-sm font-semibold text-primary hover:bg-accent/40"
                activeProps={{ className: "px-3 py-1.5 rounded-md text-sm font-semibold text-primary bg-accent/60" }}>Admin</Link>
            )}
          </nav>
          <div className="flex items-center gap-2">
            {signedIn ? (
              <Button size="sm" variant="ghost" onClick={signOut} className="hidden md:inline-flex">
                <LogOut className="size-4" /> Sign out
              </Button>
            ) : (
              <Button size="sm" variant="default" asChild className="hidden md:inline-flex">
                <Link to="/auth"><LogIn className="size-4" /> Sign in</Link>
              </Button>
            )}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button size="icon" variant="ghost" className="md:hidden"><Menu /></Button>
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
                  {admin && (
                    <Link to="/admin" className="px-3 py-2.5 rounded-md text-base font-semibold text-primary hover:bg-accent/60">Admin</Link>
                  )}
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
      <footer className="border-t border-border py-4 text-center text-[11px] text-muted-foreground/80">
        HAM PRO © Josiah Brian Chirambo
      </footer>
    </div>
  );
}