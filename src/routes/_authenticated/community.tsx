import { createFileRoute, Link, Outlet, useMatchRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/community")({
  head: () => ({ meta: [{ title: "Community — HAM PRO" }] }),
  component: Community,
});

function Community() {
  const [groups, setGroups] = useState<{ id: string; name: string; subject: string | null; description: string | null }[]>([]);
  const matchRoute = useMatchRoute();
  const inChild = !!matchRoute({ to: "/community/$groupId" });
  useEffect(() => {
    supabase.from("study_groups").select("id,name,subject,description").order("created_at").then(({ data }) => setGroups(data ?? []));
  }, []);
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold flex items-center gap-2"><Users className="text-primary" /> Study Groups</h1>
      <p className="text-muted-foreground mt-1">Live chat rooms for learners worldwide.</p>
      {!inChild && (
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((g) => (
            <Link key={g.id} to="/community/$groupId" params={{ groupId: g.id }} className="rounded-2xl border bg-card p-5 hover:shadow-[var(--shadow-leaf)] transition">
              <p className="text-xs uppercase text-muted-foreground">{g.subject ?? "General"}</p>
              <h2 className="font-semibold mt-1">{g.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">{g.description}</p>
            </Link>
          ))}
        </div>
      )}
      <Outlet />
    </div>
  );
}