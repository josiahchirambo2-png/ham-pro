import type { Scholarship, Uni } from "./data";

export type Profile = {
  points: number; subjects: string[]; favourite: string; career: string; budgetZMW: number; // per semester
  country: string; mode: string; intake: string; age: number; nationality: "Zambian" | "African" | "Other";
  incomeZMW: number; female: boolean; vulnerable: boolean;
};
export const DEFAULT_PROFILE: Profile = {
  points: 18, subjects: ["English", "Mathematics", "Biology", "Chemistry"], favourite: "Biology", career: "Doctor",
  budgetZMW: 20000, country: "Zambia", mode: "On-campus", intake: "January", age: 18, nationality: "Zambian",
  incomeZMW: 5000, female: false, vulnerable: false,
};

const FIELD_WORDS: Record<string, string[]> = {
  medicine: ["doctor", "medic", "surgeon", "medicine", "biology"], health: ["nurse", "pharm", "health", "midwife", "biology", "chemistry"],
  engineering: ["engineer", "mining", "civil", "physics", "mechanic"], computing: ["software", "computer", "it", "data", "program", "developer", "ict"],
  business: ["account", "business", "bank", "econom", "commerce", "finance", "market"], law: ["law", "lawyer", "advocate", "judge", "civic"],
  education: ["teach", "education", "lecturer"], agriculture: ["farm", "agri", "agriculture"], science: ["scien", "research", "physics", "chemistry", "math"],
  social: ["social", "psycholog", "counsel", "history"],
};
export function fieldsFor(p: Pick<Profile, "career" | "favourite">): string[] {
  const t = `${p.career} ${p.favourite}`.toLowerCase();
  return Object.entries(FIELD_WORDS).filter(([, ws]) => ws.some((w) => t.includes(w))).map(([f]) => f);
}

export type UniMatch = { uni: Uni; score: number; tier: "Top Match" | "Good Match" | "Reach"; reasons: string[] };
export function matchUniversities(p: Profile, list: Uni[], zmwPerUsd: number): UniMatch[] {
  const fields = fieldsFor(p);
  return list.map((u) => {
    let s = 50; const reasons: string[] = [];
    const fit = u.fields.some((f) => fields.includes(f));
    if (fit) { s += 20; reasons.push(`Offers courses linked to ${p.career || p.favourite}`); }
    const gap = p.points - u.minPoints; // positive = weaker than needed
    if (gap <= 0) { s += 15; reasons.push(`Your ${p.points} points meet the ~${u.minPoints}-point entry level`); }
    else { s -= Math.min(30, gap * 4); reasons.push(`Entry is competitive (~${u.minPoints} points); you have ${p.points}`); }
    const semFee = (u.feesUSD * zmwPerUsd) / 2;
    if (semFee <= p.budgetZMW) { s += 10; reasons.push(`Fees (~K${Math.round(semFee).toLocaleString()}/semester) fit your budget`); }
    else s -= Math.min(20, Math.round(((semFee - p.budgetZMW) / Math.max(p.budgetZMW, 1)) * 10));
    if (p.country === "Any" || u.country === p.country || u.city.toLowerCase().includes(p.country.toLowerCase())) { s += 5; reasons.push(`In your preferred location (${u.city})`); }
    if (u.modes.includes(p.mode as never)) s += 3; else s -= 8;
    if (u.intakes.includes(p.intake as never)) { s += 2; reasons.push(`Has a ${p.intake} intake`); } else s -= 5;
    const score = Math.max(5, Math.min(98, Math.round(s)));
    const tier = gap > 4 ? "Reach" : score >= 80 ? "Top Match" : score >= 60 ? "Good Match" : "Reach";
    return { uni: u, score, tier, reasons: reasons.slice(0, 3) };
  }).sort((a, b) => b.score - a.score);
}

export type SchCheck = { sch: Scholarship; eligible: boolean; missing: string[] };
export function checkScholarships(p: Profile & { course: string }, list: Scholarship[]): SchCheck[] {
  const fields = fieldsFor({ career: p.course || p.career, favourite: p.favourite });
  return list.map((s) => {
    const missing: string[] = [];
    if (s.maxAge && p.age > s.maxAge) missing.push(`Age limit is ${s.maxAge}; you are ${p.age}`);
    if (s.maxPoints && p.points > s.maxPoints) missing.push(`Needs best-6 of ${s.maxPoints} or better; you have ${p.points}`);
    if (s.nationality === "Zambian" && p.nationality !== "Zambian") missing.push("Only for Zambian citizens");
    if (s.nationality === "African" && p.nationality === "Other") missing.push("Only for African citizens");
    if (s.maxIncomeZMW && p.incomeZMW > s.maxIncomeZMW) missing.push(`For families earning under K${s.maxIncomeZMW.toLocaleString()}/month`);
    if (s.femaleOnly && !p.female) missing.push("Only for female students");
    if (s.vulnerable && !p.vulnerable) missing.push("Only for orphans or vulnerable students");
    if (s.fields && !s.fields.some((f) => fields.includes(f))) missing.push(`Only for ${s.fields.join(" / ")} courses`);
    if (!s.level.includes("Undergraduate") && !s.level.includes("Diploma")) missing.push("Postgraduate only — apply after your first degree");
    return { sch: s, eligible: missing.length === 0, missing };
  });
}
