// Maps free-form profile education level → tier and picks labs for that tier.
export type LevelTier = "primary" | "secondary" | "university";

export function detectTier(level: string | null | undefined): LevelTier {
  const s = (level || "").toLowerCase();
  if (/(university|college|degree|undergrad|postgrad|masters|phd|year\s*[1-6])/.test(s)) return "university";
  if (/(grade\s*([7-9]|1[0-2])|secondary|high\s*school|form\s*[1-6]|senior|o.?level|a.?level|ib|igcse)/.test(s)) return "secondary";
  return "primary";
}

// Rough per-lab tier classifier — each lab gets a level based on title keywords.
export function tierForLab(title: string, subject: string): LevelTier {
  const t = `${title} ${subject}`.toLowerCase();
  const uni = [
    "e=mc", "escape velocity", "orbital", "redshift", "coulomb", "big-o", "cryptography",
    "arrhenius", "reaction rate", "buoyancy", "sorting", "solar panel", "loan payment",
    "impulse", "centripetal", "snell", "refraction", "plate tectonics",
  ];
  if (uni.some((k) => t.includes(k))) return "university";
  const sec = [
    "pendulum", "ohm", "projectile", "quadratic", "primes", "ph", "newton", "hooke",
    "kinetic", "potential", "friction", "momentum", "resistor", "acceleration",
    "levers", "pulley", "sound", "logic gates",
  ];
  if (sec.some((k) => t.includes(k))) return "secondary";
  return "primary";
}

export const TIER_LABEL: Record<LevelTier, string> = {
  primary: "Primary",
  secondary: "Secondary",
  university: "University",
};