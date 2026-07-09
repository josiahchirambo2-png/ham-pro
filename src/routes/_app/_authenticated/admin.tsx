import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ShieldCheck, CheckCircle2, XCircle } from "lucide-react";
import { isAdmin } from "@/lib/subscription";

export const Route = createFileRoute("/_app/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — HAM PRO" }] }),
  component: AdminPage,
});

function AdminPage() {
  const [ok, setOk] = useState<boolean | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { (async () => { const a = await isAdmin(); setOk(a); if (a) load(); })(); }, []);
  async function load() {
    const { data } = await (supabase as any).from("payment_submissions").select("*").order("submitted_at", { ascending: false });
    setRows(data ?? []);
  }
  async function verify(id: string) {
    const { error } = await (supabase as any).rpc("verify_payment", { _payment_id: id, _months: 1 });
    if (error) return toast.error(error.message);
    toast.success("Verified — user has 1 month of access"); load();
  }
  async function reject(id: string) {
    const { error } = await (supabase as any).rpc("reject_payment", { _payment_id: id });
    if (error) return toast.error(error.message);
    toast.success("Rejected"); load();
  }
  if (ok === null) return <div className="p-8 text-sm">Checking…</div>;
  if (!ok) return (
    <div className="mx-auto max-w-lg p-8 text-center">
      <p>You need admin access to view this page.</p>
      <Button asChild className="mt-4"><Link to="/dashboard">Back to dashboard</Link></Button>
    </div>
  );
  const pending = rows.filter((r) => r.status === "pending");
  const others = rows.filter((r) => r.status !== "pending");
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold flex items-center gap-2"><ShieldCheck className="text-primary" /> Admin — payment verification</h1>
      <p className="text-muted-foreground text-sm mt-1">Approve mobile-money payments received at +260 977873761.</p>

      <h2 className="mt-6 font-semibold">Pending ({pending.length})</h2>
      <div className="mt-2 space-y-2">
        {pending.length === 0 && <p className="text-sm text-muted-foreground">No pending submissions.</p>}
        {pending.map((r) => (
          <div key={r.id} className="rounded-xl border p-4 bg-card">
            <div className="flex items-start gap-3">
              <div className="flex-1 text-sm">
                <p><b>{r.txn_reference}</b> — {r.amount_usd} USD</p>
                <p className="text-xs text-muted-foreground">From {r.sender_name || "—"} ({r.sender_phone || "—"}) • user {r.user_id.slice(0, 8)}…</p>
                <p className="text-xs text-muted-foreground">Submitted {new Date(r.submitted_at).toLocaleString()}</p>
                {r.note && <p className="text-xs mt-1">Note: {r.note}</p>}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => verify(r.id)}><CheckCircle2 className="size-4" /> Verify</Button>
                <Button size="sm" variant="outline" onClick={() => reject(r.id)}><XCircle className="size-4" /> Reject</Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mt-8 font-semibold">History</h2>
      <div className="mt-2 space-y-1 text-sm">
        {others.map((r) => (
          <div key={r.id} className="flex items-center gap-2 rounded-lg border p-2 bg-card">
            <span className={`text-xs font-mono px-2 py-0.5 rounded ${r.status === "verified" ? "bg-green-500/20 text-green-700" : "bg-red-500/20 text-red-700"}`}>{r.status}</span>
            <span className="flex-1 truncate">{r.txn_reference}</span>
            <span className="text-xs text-muted-foreground">{new Date(r.verified_at || r.submitted_at).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}