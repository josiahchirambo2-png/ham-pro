import { useEffect, useState } from "react";
import { ArrowDownToLine, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { DOCS, CAREERS, INTERNSHIPS, INTERVIEW_QS, STORIES, STORIES_NOTE, STAGES, SUBJECT_TO_DEGREES } from "@/lib/aftergrad/data";
import { kwacha, yearlyCost, type Costs, type Workspace, type Stage } from "@/lib/aftergrad/workspace";
import { downloadReport } from "@/lib/aftergrad/pdf";
import { Field, NumberField, Options, itemClass, muted } from "./catalog";

export function CourseExplorer({ filter }: { filter: (course: string) => void }) {
  const [terms, setTerms] = useState("");
  const subjects = terms.toLowerCase().split(/[,+/;&]+/).map((s) => s.trim()).filter(Boolean);
  const degrees = new Map<string, number>();
  for (const s of subjects) for (const degree of SUBJECT_TO_DEGREES[s === "maths" ? "mathematics" : s] ?? []) degrees.set(degree, (degrees.get(degree) ?? 0) + 1);
  const matches = [...degrees.entries()].sort((a, b) => b[1] - a[1]);
  return <div className="space-y-3"><Field label="Your subjects"><Input placeholder="Biology + Chemistry" value={terms} onChange={(e) => setTerms(e.target.value)} /></Field><div className="flex flex-wrap gap-2">{matches.map(([degree, count]) => <Button key={degree} variant="outline" size="sm" onClick={() => filter(degree)}>{degree}{count > 1 ? ` · ${count} subjects` : ""}</Button>)}</div>{subjects.length > 0 && !matches.length && <p className={muted}>No matches. Try Biology, Chemistry, Mathematics, English or Computer Studies.</p>}</div>;
}
const pathFor = (account: string, i: number) => `${account}/${i}`;
function Vault({ account, workspace, save, requireAccount, pending }: { account: string | null | undefined; workspace: Workspace; save: (p: Partial<Workspace>) => Promise<boolean>; requireAccount: () => boolean; pending: boolean }) {
  const [stored, setStored] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    setStored([]); setFailed(false);
    if (!account) return;
    let active = true;
    void supabase.storage.from("aftergrad-documents").list(account).then(({ data, error }) => {
      if (active) { setFailed(Boolean(error)); setStored((data ?? []).map((f) => Number(f.name))); }
    });
    return () => { active = false; };
  }, [account, revision]);
  async function fileAction(i: number, action: "upload" | "download" | "remove", file?: File) {
    if (!requireAccount() || !account || busy) return;
    const storage = supabase.storage.from("aftergrad-documents");
    const path = pathFor(account, i);
    setBusy(true);
    try {
      if (action === "upload" && file) {
        if (file.size > 10_000_000 || !["application/pdf", "image/jpeg", "image/png"].includes(file.type)) { toast.error("Choose a PDF, JPEG, or PNG under 10 MB."); return; }
        const { error } = await storage.upload(path, file, { upsert: true, contentType: file.type, cacheControl: "0" });
        if (error) throw error;
        toast.success("Document uploaded privately.");
      } else if (action === "remove") {
        const { error } = await storage.remove([path]);
        if (error) throw error;
        toast.success("Document removed.");
      } else if (action === "download") {
        const { data, error } = await storage.download(path);
        if (error || !data) throw new Error("Download failed");
        const extension = data.type.includes("jpeg") ? "jpg" : data.type.includes("png") ? "png" : "pdf";
        const url = URL.createObjectURL(data);
        const link = document.createElement("a"); link.href = url; link.download = `${DOCS[i]}.${extension}`; link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
      }
      setRevision((v) => v + 1);
    } catch { toast.error("Could not access your document. Please try again online."); }
    finally { setBusy(false); }
  }
  return <div className="space-y-3"><p className={muted}>{DOCS.filter((d) => workspace.docs[d]).length} of {DOCS.length} documents marked ready · PDF, JPEG or PNG up to 10 MB</p>{failed && <p role="alert" className={muted}>Couldn’t load the vault. Reconnect and try again.</p>}
    {!account && <Button size="sm" onClick={requireAccount}>Sign in to use the vault</Button>}
    {DOCS.map((d, i) => <div key={d} className="flex flex-wrap items-center justify-between gap-2 border-b border-border py-2"><label className="flex items-center gap-2 text-sm"><input type="checkbox" className="size-4 accent-primary" disabled={pending} checked={Boolean(workspace.docs[d])} onChange={(e) => void save({ docs: { ...workspace.docs, [d]: e.target.checked } })} />{d}</label>{account && <div className="flex items-center gap-1"><Button size="sm" variant="outline" disabled={busy} onClick={() => document.getElementById(`aftergrad-doc-${i}`)?.click()}>{stored.includes(i) ? "Replace" : "Upload"}</Button><input type="file" id={`aftergrad-doc-${i}`} hidden accept="application/pdf,image/jpeg,image/png" onChange={(e) => { const file = e.currentTarget.files?.[0]; if (file) void fileAction(i, "upload", file); e.currentTarget.value = ""; }} />{stored.includes(i) && <><Button size="icon" variant="ghost" aria-label={`Download ${d}`} onClick={() => void fileAction(i, "download")} disabled={busy}><ArrowDownToLine /></Button><Button size="icon" variant="ghost" aria-label={`Remove ${d}`} onClick={() => void fileAction(i, "remove")} disabled={busy}><Trash2 /></Button></>}</div>}</div>)}
  </div>;
}

const templates = {
  "Personal statement": "I am applying for [course or scholarship] because [real motivation].\n\nOne experience that shaped this goal was [specific situation]. My role was [action] and I learned [lesson].\n\nWith this opportunity, I plan to [next step] and contribute to [community or goal].",
  "Financial need essay": "My goal is to study [course] because [reason].\n\nThe main barrier to continuing my education is [specific challenge]. I have already taken [steps].\n\nThis support would help me cover [relevant costs] and make it possible for me to [practical result].",
};
export function Preparation({ tool, workspace: w, account, pending, save, requireAccount, openAsap, costs, setCosts, report, opportunityName }: {
  tool: string; workspace: Workspace; account: string | null | undefined; pending: boolean; save: (p: Partial<Workspace>) => Promise<boolean>; requireAccount: () => boolean; openAsap: (p: string) => void; costs: Costs; setCosts: (c: Costs) => void; report: (parent?: boolean) => void; opportunityName: (key: string) => string;
}) {
  const [essay, setEssay] = useState(w.essay);
  const [cv, setCv] = useState({ Name: "", Contact: "", Education: "", Skills: "", Experience: "", Achievements: "" });
  useEffect(() => setEssay(w.essay), [w.essay, account]);
  switch (tool) {
    case "Application Tracker": return <div className="space-y-3">{Object.entries(w.stages).length === 0 && <p className={muted}>No applications yet. Choose “Track application” on a university or scholarship.</p>}{Object.entries(w.stages).map(([key, stage]) => <div key={key} className="flex flex-wrap items-end gap-2 border-b border-border pb-3"><Options label={opportunityName(key)} value={stage} options={STAGES} change={(v) => void save({ stages: { ...w.stages, [key]: v as Stage } })} /><Button size="icon" variant="ghost" disabled={pending} aria-label={`Remove ${opportunityName(key)} from tracker`} onClick={() => { const stages = { ...w.stages }; delete stages[key]; void save({ stages }); }}><Trash2 /></Button></div>)}{w.tasks.length > 0 && <div className="space-y-2"><h3 className="font-semibold">Application to-do list</h3>{w.tasks.map((task, i) => <label key={task.text} className="flex gap-2 text-sm"><input type="checkbox" disabled={pending} checked={task.done} onChange={(e) => void save({ tasks: w.tasks.map((t, j) => j === i ? { ...t, done: e.target.checked } : t) })} />{task.text}</label>)}</div>}</div>;
    case "Document Vault": return <Vault account={account} workspace={w} save={save} pending={pending} requireAccount={requireAccount} />;
    case "Essay Helper": return <div className="space-y-3"><div className="flex flex-wrap gap-2">{Object.entries(templates).map(([name, text]) => <Button key={name} size="sm" variant="outline" onClick={() => { if (!essay.trim() || window.confirm("Replace the current draft with this template?")) setEssay(text); }}>{name}</Button>)}</div><Textarea aria-label="Essay draft" rows={8} maxLength={16000} value={essay} onChange={(e) => setEssay(e.target.value)} /><div className="flex flex-wrap gap-2"><Button disabled={pending} onClick={() => void save({ essay }).then((ok) => { if (ok) toast.success("Draft saved."); })}>Save draft</Button><Button variant="outline" onClick={() => openAsap("Help me improve a scholarship essay. What makes a strong opening and a specific example?")}>Ask ASAP</Button></div></div>;
    case "Career Roadmap": return <div className="grid gap-3 sm:grid-cols-2">{CAREERS.map((c) => <article className={itemClass} key={c.degree}><h3 className="font-semibold">{c.degree}</h3><p className="mt-2 text-sm">{c.jobs.join(" · ")}</p><p className={muted}>Estimated Zambia salary: {c.salaryZMW}</p><p className={`${muted} mt-2`}>Skills: {c.skills.join(", ")}</p></article>)}</div>;
    case "CV Builder": return <form className="grid gap-3 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); void downloadReport(cv.Name.trim() || "Student CV", "kit-ai-student-cv.pdf", Object.entries(cv).filter(([k, v]) => k !== "Name" && v.trim()).map(([title, v]) => ({ title, lines: v.split("\n") }))).catch(() => toast.error("Could not download your CV.")); }}>{Object.entries(cv).map(([label, value]) => <Field key={label} label={label}>{["Name", "Contact"].includes(label) ? <Input value={value} required={label === "Name"} maxLength={120} onChange={(e) => setCv({ ...cv, [label]: e.target.value })} /> : <Textarea value={value} maxLength={1000} onChange={(e) => setCv({ ...cv, [label]: e.target.value })} />}</Field>)}<div><Button type="submit"><FileText /> Download CV</Button></div></form>;
    case "Interview Practice": return <ol className="space-y-2">{INTERVIEW_QS.map(([q, answer], i) => <li key={q} className="border-b border-border pb-2"><details><summary className="cursor-pointer text-sm font-medium">{i + 1}. {q}</summary><p className={`${muted} mt-2`}>{answer}</p><Button className="mt-2" size="sm" variant="outline" onClick={() => openAsap(`Act as my scholarship interviewer. Ask me: ${q} Then wait for my response and give feedback.`)}>Practise with ASAP</Button></details></li>)}</ol>;
    case "Gap-year Work": return <div className="space-y-3"><p className={muted}>Examples of roles to look for, not current vacancies. Pay is illustrative.</p><div className="grid gap-3 sm:grid-cols-2">{INTERNSHIPS.map((job) => <article className={itemClass} key={job.title}><h3 className="font-semibold">{job.title}</h3><p className={muted}>{job.org} · {job.place}</p><p className="mt-2 text-sm">{job.type} · {job.pay}</p></article>)}</div></div>;
    case "Study Cost Calculator": return <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); void save({ costs }).then((ok) => { if (ok) toast.success("Costs saved."); }); }}><div className="grid gap-3 sm:grid-cols-2">{(Object.keys(costs) as (keyof Costs)[]).map((k) => <NumberField key={k} label={`${k[0].toUpperCase()}${k.slice(1)} (${k === "tuition" ? "yearly" : "monthly"}, ZMW)`} value={costs[k]} change={(v) => setCosts({ ...costs, [k]: v })} />)}</div><p className="text-xl font-semibold">Yearly total: {Number.isFinite(yearlyCost(costs)) ? kwacha(yearlyCost(costs)) : "—"}</p><p className={muted}>Compare accommodation and transport, ask about payment plans, and check HELSB or university bursaries before paying a deposit.</p><Button type="submit" disabled={pending || !Object.values(costs).every((v) => Number.isFinite(v) && v >= 0)}>Save estimate</Button></form>;
    case "Parent Mode": return <div className="space-y-3"><p className={muted}>The report includes study options, possible funding and estimated costs. It leaves out private documents and essay drafts.</p><Button onClick={() => report(true)}><ArrowDownToLine /> Download parent report</Button></div>;
    case "Success Stories": return <div className="space-y-3"><p className={muted}>{STORIES_NOTE}</p>{STORIES.map((s) => <blockquote key={s.name} className="border-l-2 border-border pl-3 text-sm"><p>{s.advice}</p><footer className={muted}>{s.name} · {s.from} · {s.award} (illustrative)</footer></blockquote>)}</div>;
    default: return null;
  }
}
