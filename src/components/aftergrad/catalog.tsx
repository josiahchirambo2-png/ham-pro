import { ArrowUpRight, Bell, Bookmark, GitCompareArrows, GraduationCap, MapPin, Share2, University } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SCHOLARSHIPS, daysUntil, type Scholarship, type Uni } from "@/lib/aftergrad/data";
import type { UniMatch } from "@/lib/aftergrad/match";
import { kwacha, semesterFee } from "@/lib/aftergrad/workspace";
import type { ReactNode } from "react";

export const fieldClass = "flex min-w-0 flex-col gap-1.5 text-sm font-medium";
export const selectClass = "h-9 w-full min-w-0 rounded-md border border-input bg-background px-2.5 text-sm focus-visible:outline-2 focus-visible:outline-ring";
export const itemClass = "min-w-0 rounded-lg border border-border bg-card p-4 sm:p-5";
export const muted = "text-sm text-muted-foreground";
export function Field({ label, children }: { label: string; children: ReactNode }) { return <label className={fieldClass}>{label}{children}</label>; }
export function NumberField({ label, value, change, min = 0, max = 10000000 }: { label: string; value: number; change: (v: number) => void; min?: number; max?: number }) {
  return <Field label={label}><Input type="number" value={Number.isNaN(value) ? "" : value} min={min} max={max} onChange={(e) => change(e.currentTarget.valueAsNumber)} /></Field>;
}
export function Options({ label, value, change, options }: { label: string; value: string; change: (v: string) => void; options: readonly string[] }) {
  return <Field label={label}><select className={selectClass} value={value} onChange={(e) => change(e.target.value)}>{options.map((o) => <option key={o}>{o}</option>)}</select></Field>;
}
export function Tag({ children }: { children: ReactNode }) { return <span className="inline-flex items-center rounded-md border border-border px-2 py-1 text-xs font-medium">{children}</span>; }
export function shareLink(name: string, website: string) { return `https://wa.me/?text=${encodeURIComponent(`${name} — ${website}`)}`; }
export function Deadline({ date }: { date: string }) {
  const days = daysUntil(date);
  const formatted = new Intl.DateTimeFormat("en-ZM", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(date));
  return <>{formatted} · {days < 0 ? "Estimated date passed" : days === 0 ? "Today" : `${days} days left`}</>;
}
function Actions({ name, site, saved, onSave, onTrack, busy }: { name: string; site: string; saved: boolean; onSave: () => void; onTrack: () => void; busy: boolean }) {
  return <div className="flex flex-wrap items-center gap-2">
    <Button variant="outline" size="sm" aria-pressed={saved} disabled={busy} onClick={onSave}><Bookmark className={saved ? "fill-current" : undefined} />{saved ? "Saved" : "Save"}</Button>
    <Button variant="ghost" size="sm" disabled={busy} onClick={onTrack}>Track application</Button>
    <Button variant="ghost" size="icon" asChild><a aria-label={`Share ${name} on WhatsApp`} title="Share on WhatsApp" href={shareLink(name, site)} target="_blank" rel="noreferrer"><Share2 /></a></Button>
  </div>;
}
export function UniversityCard({ university: u, match, saved, compared, onSave, onTrack, onCompare, busy }: { university: Uni; match?: UniMatch; saved: boolean; compared: boolean; onSave: () => void; onTrack: () => void; onCompare: () => void; busy: boolean }) {
  return <article className={`${itemClass} flex flex-col gap-4`} aria-label={u.name}>
    <div className="flex items-start justify-between gap-3"><div className="grid size-10 shrink-0 place-items-center rounded-md bg-muted"><University className="size-5" /></div>{match && <Tag>{match.tier} · {match.score}%</Tag>}</div>
    <div><h3 className="text-lg font-semibold leading-tight">{u.name}</h3><p className={`${muted} mt-1 flex items-center gap-1.5`}><MapPin className="size-3.5 shrink-0" />{u.city}, {u.country} · {u.type}</p></div>
    <p className="text-sm">{u.courses.slice(0, 3).join(" · ")}</p>
    {match && <ul className={`${muted} list-disc space-y-1 pl-4`}>{match.reasons.map((r) => <li key={r}>{r}</li>)}</ul>}
    <div className="mt-auto border-t border-border pt-3"><p className="text-lg font-semibold">{kwacha(semesterFee(u))} <span className="text-xs font-normal text-muted-foreground">estimated / semester</span></p><p className={`${muted} mt-1`}>Intakes: {u.intakes.join(", ")}</p></div>
    <div className="flex flex-wrap gap-2">
      <Dialog><DialogTrigger asChild><Button size="sm">University details</Button></DialogTrigger><DialogContent className="max-h-[85dvh] overflow-y-auto"><DialogHeader><DialogTitle>{u.name}</DialogTitle><DialogDescription>{u.city}, {u.country} · {u.type} · {u.verified ? "Verified listing" : "Unverified listing"}</DialogDescription></DialogHeader><div className="space-y-3 text-sm"><p><strong>Courses:</strong> {u.courses.join(", ")}</p><p><strong>Entry:</strong> {u.requirements}</p><p><strong>Estimated tuition:</strong> {kwacha(semesterFee(u))} per semester</p><p><strong>Estimated deadline:</strong> <Deadline date={u.deadline} /></p><p><strong>Study modes:</strong> {u.modes.join(", ")}</p><p><strong>Funding to explore:</strong> {u.scholarships.map((id) => SCHOLARSHIPS.find((s) => s.id === id)?.name).filter(Boolean).join(", ") || "Ask the university"}</p></div><Button asChild><a href={u.website} target="_blank" rel="noreferrer">Apply on official website <ArrowUpRight /></a></Button></DialogContent></Dialog>
      <Button variant="outline" size="sm" aria-pressed={compared} onClick={onCompare}><GitCompareArrows />{compared ? "Selected" : "Compare"}</Button>
    </div>
    <Actions name={u.name} site={u.website} saved={saved} onSave={onSave} onTrack={onTrack} busy={busy} />
  </article>;
}
export function ScholarshipCard({ scholarship: s, missing, saved, reminded, onSave, onTrack, onRemind, busy }: { scholarship: Scholarship; missing?: string[]; saved: boolean; reminded: boolean; onSave: () => void; onTrack: () => void; onRemind: () => void; busy: boolean }) {
  return <article className={`${itemClass} flex flex-col gap-4`} aria-label={s.name}>
    <div className="flex flex-wrap items-center justify-between gap-2"><div className="grid size-10 place-items-center rounded-md bg-muted"><GraduationCap className="size-5" /></div><Tag>{s.coverage}</Tag></div>
    <div><h3 className="text-lg font-semibold leading-tight">{s.name}</h3><p className={`${muted} mt-1`}>{s.provider} · {s.country}</p></div>
    <p className="text-sm">{s.amount} · {s.level.join(" / ")}</p>
    <p className={muted}>{s.category} · {s.verified ? "Verified" : "Unverified / estimated"}</p>
    <p className="text-sm font-medium"><Deadline date={s.deadline} /></p>
    {missing && <div className="rounded-md bg-muted p-3 text-sm">{missing.length ? <ul className="list-disc pl-4">{missing.map((m) => <li key={m}>{m}</li>)}</ul> : "Matches the criteria we can check. Confirm all requirements with the provider."}</div>}
    <details className="mt-auto border-t border-border pt-3 text-sm"><summary className="cursor-pointer font-medium">Eligibility requirements</summary><ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">{s.requirements.map((r) => <li key={r}>{r}</li>)}</ul></details>
    <div className="flex flex-wrap gap-2"><Button size="sm" asChild><a href={s.website} target="_blank" rel="noreferrer">Provider website <ArrowUpRight /></a></Button><Button size="sm" variant="outline" disabled={busy} aria-pressed={reminded} onClick={onRemind}><Bell />{reminded ? "Reminder on" : "Remind me"}</Button></div>
    <Actions name={s.name} site={s.website} saved={saved} onSave={onSave} onTrack={onTrack} busy={busy} />
  </article>;
}
