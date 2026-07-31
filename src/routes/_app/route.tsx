import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { AccessGate } from "@/components/access-gate";

export const Route = createFileRoute("/_app")({
  ssr: false,
  component: () => (
    <AppShell>
      <AccessGate>
        <Outlet />
      </AccessGate>
    </AppShell>
  ),
});