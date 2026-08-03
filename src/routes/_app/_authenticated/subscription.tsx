import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CreditCard, Phone, CheckCircle2, Clock, XCircle } from "lucide-react";
import { fetchSubscription, type SubStatus } from "@/lib/subscription";

export const Route = createFileRoute("/_app/_authenticated/subscription")({
  head: () => ({ meta: [{ title: "Subscription — HAM PRO" }] }),
  component: SubscriptionPage,
});

const PAY_TO = ["+260 977873761", "+260 977935215"];
const PRICE = "5 US dollars / month";

function SubscriptionPage() {
  const [sub, setSub] = useState<SubStatus | null>(null);
  const [subs, setSubs] = useState<any[]>([]);
  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [txn, setTxn] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { refresh(); }, []);
  async function refresh() {
    setSub(await fetchSubscription());
    const { data } = await (supabase as any).from("payment_submissions").select("*").order("submitted_at", { ascending: false });
    setSubs(data ?? []);
  }
  async function submit() {
    if (!txn.trim()) return toast.error("Enter the mobile-money transaction reference");
    setBusy(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBusy(false); return; }
    const { error } = await (supabase as any).from("payment_submissions").insert({
      user_id: user.id, amount_usd: 5, sender_name: senderName, sender_phone: senderPhone, txn_reference: txn, note,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Submitted — an admin will verify shortly");
    setTxn(""); setNote(""); refresh();
  }

  const trialLeft = sub?.trialEndsAt ? Math.max(0, Math.ceil((new Date(sub.trialEndsAt).getTime() - Date.now()) / 86400000)) : 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold flex items-center gap-2"><CreditCard className="text-primary" /> Subscription</h1>

      <div className="mt-4 rounded-2xl border bg-card p-6">
        {sub?.adminBypass ? (
          <p className="text-sm">✅ Lifetime access (admin).</p>
        ) : sub?.hasAccess ? (
          <p className="text-sm">
            You have access. Status: <b>{sub.status}</b>
            {sub.status === "trial" && trialLeft > 0 && <> — {trialLeft} day{trialLeft === 1 ? "" : "s"} of free trial left.</>}
            {sub.currentPeriodEnd && <> Renews before {new Date(sub.currentPeriodEnd).toLocaleDateString()}.</>}
          </p>
        ) : (
          <p className="text-sm text-destructive">Your trial has ended. Please subscribe below to keep learning.</p>
        )}
      </div>

      <div className="mt-6 rounded-2xl border bg-card p-6 space-y-4">
        <div>
          <h2 className="font-semibold flex items-center gap-2"><Phone className="size-4" /> How to pay</h2>
          <p className="text-sm text-muted-foreground mt-1">Send <b>{PRICE}</b> via mobile money to either number:</p>
          <ul className="mt-1 space-y-1">
            {PAY_TO.map((n) => (<li key={n} className="text-lg font-mono">{n}</li>))}
          </ul>
          <p className="text-xs text-muted-foreground mt-1">After sending, paste the transaction reference below. An admin verifies within 24 hours.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><label className="text-xs">Your name</label><Input value={senderName} onChange={(e) => setSenderName(e.target.value)} /></div>
          <div><label className="text-xs">Your phone</label><Input value={senderPhone} onChange={(e) => setSenderPhone(e.target.value)} /></div>
        </div>
        <div><label className="text-xs">Transaction reference *</label><Input value={txn} onChange={(e) => setTxn(e.target.value)} placeholder="e.g. MP24072815..." /></div>
        <div><label className="text-xs">Note (optional)</label><Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} /></div>
        <Button className="w-full" onClick={submit} disabled={busy}>Submit payment for verification</Button>
      </div>

      <h3 className="mt-8 font-semibold">Your submissions</h3>
      <div className="mt-2 space-y-2">
        {subs.length === 0 && <p className="text-sm text-muted-foreground">Nothing submitted yet.</p>}
        {subs.map((s) => (
          <div key={s.id} className="rounded-xl border p-3 bg-card text-sm flex items-center gap-3">
            {s.status === "verified" ? <CheckCircle2 className="text-green-500 size-5" /> :
              s.status === "rejected" ? <XCircle className="text-red-500 size-5" /> :
              <Clock className="text-amber-500 size-5" />}
            <div className="flex-1">
              <p><b>{s.txn_reference}</b> — {s.amount_usd} USD</p>
              <p className="text-xs text-muted-foreground">Submitted {new Date(s.submitted_at).toLocaleString()}</p>
            </div>
            <span className="text-xs uppercase font-mono">{s.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}