import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CalendarClock, Bell, Plus, Trash2, Play } from "lucide-react";

export const Route = createFileRoute("/_app/_authenticated/schedule")({
  head: () => ({ meta: [{ title: "Study Schedule — HAM PRO" }] }),
  component: SchedulePage,
});

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function SchedulePage() {
  const [items, setItems] = useState<any[]>([]);
  const [subject, setSubject] = useState("");
  const [day, setDay] = useState("1");
  const [time, setTime] = useState("18:00");
  const [duration, setDuration] = useState(30);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => { load(); if ("Notification" in window) setPermission(Notification.permission); }, []);

  async function load() {
    const { data } = await (supabase as any).from("study_schedule").select("*").order("day_of_week").order("time_of_day");
    setItems(data ?? []);
  }

  async function askPermission() {
    if (!("Notification" in window)) return toast.error("Notifications not supported in this browser");
    const p = await Notification.requestPermission();
    setPermission(p);
    if (p === "granted") toast.success("Reminders enabled");
  }

  async function add() {
    if (!subject.trim()) return toast.error("Enter a subject");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await (supabase as any).from("study_schedule").insert({
      user_id: user.id, subject, day_of_week: Number(day), time_of_day: time, duration_minutes: duration,
    });
    if (error) return toast.error(error.message);
    setSubject(""); toast.success("Added to timetable"); load();
    if (permission !== "granted") askPermission();
  }

  async function del(id: string) {
    await (supabase as any).from("study_schedule").delete().eq("id", id); load();
  }

  // Reminder scheduler — checks every 30s, fires notification within the minute of a slot.
  useEffect(() => {
    if (!("Notification" in window)) return;
    const fired = new Set<string>();
    const t = setInterval(() => {
      if (Notification.permission !== "granted") return;
      const now = new Date();
      const dow = now.getDay(), hh = now.getHours(), mm = now.getMinutes();
      const key = `${dow}-${hh}:${mm}`;
      items.forEach((s) => {
        if (!s.notify) return;
        const [sh, sm] = String(s.time_of_day).split(":").map(Number);
        if (s.day_of_week !== dow || sh !== hh || sm !== mm) return;
        const uniq = `${s.id}-${key}`;
        if (fired.has(uniq)) return;
        fired.add(uniq);
        new Notification("HAM PRO — study time", { body: `Time to study ${s.subject} for ${s.duration_minutes} min.` });
      });
    }, 30_000);
    return () => clearInterval(t);
  }, [items]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold flex items-center gap-2"><CalendarClock className="text-primary" /> Study Schedule</h1>
      <p className="text-muted-foreground mt-1">The app pings you when a subject's slot arrives, then tracks the time and quizzes you.</p>

      <div className="mt-4 flex items-center gap-3">
        <Button variant={permission === "granted" ? "outline" : "default"} onClick={askPermission}>
          <Bell className="size-4" /> {permission === "granted" ? "Reminders on" : "Turn on reminders"}
        </Button>
        {permission !== "granted" && <span className="text-xs text-muted-foreground">Install as an app to get reminders while it's closed.</span>}
      </div>

      <div className="mt-6 rounded-2xl border bg-card p-4 grid sm:grid-cols-5 gap-2">
        <Input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="sm:col-span-2" />
        <Select value={day} onValueChange={setDay}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{DAYS.map((d, i) => <SelectItem key={d} value={String(i)}>{d}</SelectItem>)}</SelectContent>
        </Select>
        <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        <div className="flex gap-2">
          <Input type="number" min={5} max={240} value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
          <Button onClick={add}><Plus className="size-4" /></Button>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        {items.length === 0 && <p className="text-sm text-muted-foreground">Nothing scheduled yet.</p>}
        {items.map((s) => (
          <div key={s.id} className="flex items-center gap-3 rounded-xl border p-3 bg-card">
            <div className="flex-1">
              <p className="font-medium">{s.subject}</p>
              <p className="text-xs text-muted-foreground">{DAYS[s.day_of_week]} • {s.time_of_day} • {s.duration_minutes} min</p>
            </div>
            <Button size="sm" asChild>
              <Link to="/study/$subject" params={{ subject: s.subject }} search={{ minutes: s.duration_minutes }}>
                <Play className="size-4" /> Start
              </Link>
            </Button>
            <Button size="icon" variant="ghost" onClick={() => del(s.id)}><Trash2 className="size-4" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}