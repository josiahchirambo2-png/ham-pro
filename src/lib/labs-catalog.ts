import type { LabConfig } from "@/components/lab-simulator";

const PI = Math.PI;

function pendulum(p: Record<string, number>) {
  const T = 2 * PI * Math.sqrt(p.length / p.gravity);
  return [
    { label: "Period T", value: `${T.toFixed(3)} s` },
    { label: "Frequency", value: `${(1 / T).toFixed(3)} Hz` },
  ];
}
function ohm(p: Record<string, number>) {
  const I = p.voltage / p.resistance;
  return [
    { label: "Current I", value: `${I.toFixed(3)} A` },
    { label: "Power", value: `${(p.voltage * I).toFixed(3)} W` },
  ];
}
function projectile(p: Record<string, number>) {
  const v = p.velocity, a = (p.angle * PI) / 180, g = 9.81;
  const t = (2 * v * Math.sin(a)) / g;
  const range = (v * v * Math.sin(2 * a)) / g;
  const h = (v * v * Math.sin(a) ** 2) / (2 * g);
  return [
    { label: "Time of flight", value: `${t.toFixed(2)} s` },
    { label: "Range", value: `${range.toFixed(2)} m` },
    { label: "Max height", value: `${h.toFixed(2)} m` },
  ];
}
function quadratic(p: Record<string, number>) {
  const { a, b, c } = p;
  const d = b * b - 4 * a * c;
  if (a === 0) return [{ label: "Note", value: "a cannot be 0" }];
  if (d < 0) return [{ label: "Discriminant", value: d.toFixed(2) }, { label: "Roots", value: "complex" }];
  const r1 = (-b + Math.sqrt(d)) / (2 * a), r2 = (-b - Math.sqrt(d)) / (2 * a);
  return [
    { label: "Discriminant", value: d.toFixed(2) },
    { label: "Root 1", value: r1.toFixed(3) },
    { label: "Root 2", value: r2.toFixed(3) },
    { label: "Vertex x", value: (-b / (2 * a)).toFixed(3) },
  ];
}
function primes(p: Record<string, number>) {
  const n = Math.floor(p.upTo);
  const sieve = new Uint8Array(n + 1);
  const out: number[] = [];
  for (let i = 2; i <= n; i++) {
    if (!sieve[i]) { out.push(i); for (let j = i * i; j <= n; j += i) sieve[j] = 1; }
  }
  return [
    { label: "Count", value: out.length.toString() },
    { label: "First 12", value: out.slice(0, 12).join(", ") },
    { label: "Largest", value: (out[out.length - 1] ?? 0).toString() },
  ];
}
function pH(p: Record<string, number>) {
  return [
    { label: "pH", value: p.h.toFixed(2) },
    { label: "pOH", value: (14 - p.h).toFixed(2) },
    { label: "Nature", value: p.h < 7 ? "Acidic" : p.h > 7 ? "Basic" : "Neutral" },
    { label: "[H+]", value: `${Math.pow(10, -p.h).toExponential(2)} mol/L` },
  ];
}
function newton2(p: Record<string, number>) {
  return [{ label: "Force = m·a", value: `${(p.mass * p.acceleration).toFixed(2)} N` }];
}
function ke(p: Record<string, number>) {
  return [{ label: "KE = ½mv²", value: `${(0.5 * p.mass * p.velocity ** 2).toFixed(2)} J` }];
}
function pe(p: Record<string, number>) {
  return [{ label: "PE = mgh", value: `${(p.mass * 9.81 * p.height).toFixed(2)} J` }];
}
function hooke(p: Record<string, number>) {
  return [{ label: "F = kx", value: `${(p.k * p.x).toFixed(2)} N` }, { label: "Energy ½kx²", value: `${(0.5 * p.k * p.x ** 2).toFixed(2)} J` }];
}
function density(p: Record<string, number>) {
  return [{ label: "Density ρ = m/V", value: `${(p.mass / p.volume).toFixed(3)} kg/m³` }];
}
function pressure(p: Record<string, number>) {
  return [{ label: "Pressure P = F/A", value: `${(p.force / p.area).toFixed(3)} Pa` }];
}
function wave(p: Record<string, number>) {
  return [{ label: "v = f·λ", value: `${(p.frequency * p.wavelength).toFixed(2)} m/s` }];
}
function lens(p: Record<string, number>) {
  const f = (p.do * p.di) / (p.do + p.di);
  return [{ label: "1/f = 1/do + 1/di → f", value: `${f.toFixed(3)}` }, { label: "Magnification", value: (-p.di / p.do).toFixed(3) }];
}
function decay(p: Record<string, number>) {
  const left = p.n0 * Math.pow(0.5, p.time / p.halfLife);
  return [{ label: "Remaining N", value: left.toFixed(3) }];
}
function molarity(p: Record<string, number>) {
  return [{ label: "M = n/V", value: `${(p.moles / p.volume).toFixed(3)} mol/L` }];
}
function gas(p: Record<string, number>) {
  const V = (p.n * 0.0821 * p.T) / p.P;
  return [{ label: "PV = nRT → V", value: `${V.toFixed(3)} L` }];
}
function heatTransfer(p: Record<string, number>) {
  return [{ label: "Q = mcΔT", value: `${(p.mass * p.c * p.dt).toFixed(2)} J` }];
}
function bmi(p: Record<string, number>) {
  const b = p.mass / (p.height ** 2);
  return [{ label: "BMI", value: b.toFixed(2) }, { label: "Category", value: b < 18.5 ? "Underweight" : b < 25 ? "Normal" : b < 30 ? "Overweight" : "Obese" }];
}
function punnett(p: Record<string, number>) {
  // Aa x Aa
  const dom = p.dominantParents; // 0,1,2 dominant alleles in parent A
  // Simple monohybrid
  return [
    { label: "AA (homozygous dominant)", value: "25%" },
    { label: "Aa (heterozygous)", value: "50%" },
    { label: "aa (homozygous recessive)", value: "25%" },
    { label: "Showing dominant trait", value: `${dom >= 1 ? 75 : 0}%` },
  ];
}
function probability(p: Record<string, number>) {
  const single = p.favorable / p.total;
  return [
    { label: "P(event)", value: single.toFixed(4) },
    { label: "Percent", value: `${(single * 100).toFixed(2)}%` },
    { label: "Odds", value: `${p.favorable} : ${p.total - p.favorable}` },
  ];
}
function compound(p: Record<string, number>) {
  const A = p.principal * Math.pow(1 + p.rate / 100 / p.n, p.n * p.years);
  return [{ label: "Final amount", value: A.toFixed(2) }, { label: "Interest earned", value: (A - p.principal).toFixed(2) }];
}
function triangle(p: Record<string, number>) {
  // sides a, b, angle C
  const c2 = p.a * p.a + p.b * p.b - 2 * p.a * p.b * Math.cos((p.C * PI) / 180);
  const c = Math.sqrt(c2);
  const area = 0.5 * p.a * p.b * Math.sin((p.C * PI) / 180);
  return [{ label: "Side c (law of cosines)", value: c.toFixed(3) }, { label: "Area", value: area.toFixed(3) }];
}
function logb(p: Record<string, number>) {
  return [{ label: `log base ${p.base} of ${p.x}`, value: (Math.log(p.x) / Math.log(p.base)).toFixed(4) }];
}
function trig(p: Record<string, number>) {
  const r = (p.angle * PI) / 180;
  return [{ label: "sin", value: Math.sin(r).toFixed(4) }, { label: "cos", value: Math.cos(r).toFixed(4) }, { label: "tan", value: Math.tan(r).toFixed(4) }];
}
function binary(p: Record<string, number>) {
  const n = Math.floor(p.number);
  return [
    { label: "Binary", value: n.toString(2) },
    { label: "Octal", value: n.toString(8) },
    { label: "Hex", value: n.toString(16).toUpperCase() },
  ];
}
function modular(p: Record<string, number>) {
  return [{ label: `${p.a} mod ${p.m}`, value: ((p.a % p.m + p.m) % p.m).toString() }];
}
function setTheory(p: Record<string, number>) {
  const A = p.a, B = p.b, both = p.intersection;
  return [{ label: "A ∪ B", value: (A + B - both).toString() }, { label: "A ∩ B", value: both.toString() }, { label: "A − B", value: (A - both).toString() }];
}
function meanMedian(p: Record<string, number>) {
  // Treat sliders as a 5-number dataset
  const arr = [p.n1, p.n2, p.n3, p.n4, p.n5].slice().sort((a, b) => a - b);
  const mean = arr.reduce((s, x) => s + x, 0) / arr.length;
  return [{ label: "Mean", value: mean.toFixed(2) }, { label: "Median", value: arr[2].toFixed(2) }, { label: "Range", value: (arr[4] - arr[0]).toFixed(2) }];
}
function photosynthesis(p: Record<string, number>) {
  // Rate ~ light * CO2 (saturating)
  const rate = (p.light / (p.light + 50)) * (p.co2 / (p.co2 + 200)) * 100 * (p.temperature > 35 || p.temperature < 5 ? 0.3 : 1);
  return [{ label: "Relative rate", value: `${rate.toFixed(1)} %` }];
}
function cellSize(p: Record<string, number>) {
  const sa = 6 * p.size ** 2, vol = p.size ** 3;
  return [{ label: "Surface area", value: sa.toFixed(2) }, { label: "Volume", value: vol.toFixed(2) }, { label: "SA:V ratio", value: (sa / vol).toFixed(3) }];
}
function ecosystem(p: Record<string, number>) {
  const next = Math.max(0, p.population + p.population * (p.birthRate - p.deathRate) / 100 - p.predators * 2);
  return [{ label: "Next-year population", value: Math.round(next).toString() }];
}
function richter(p: Record<string, number>) {
  return [{ label: "Energy ratio vs M0", value: Math.pow(10, 1.5 * p.magnitude).toExponential(2) }];
}
function gravityPlanet(p: Record<string, number>) {
  const G = 6.674e-11;
  return [{ label: "g = GM/r²", value: `${((G * p.mass) / (p.radius * p.radius)).toExponential(3)} m/s²` }];
}
function orbital(p: Record<string, number>) {
  const T = 2 * PI * Math.sqrt(p.radius ** 3 / (6.674e-11 * p.centralMass));
  return [{ label: "Period T", value: `${(T / 3600).toFixed(2)} h` }];
}
function escapeV(p: Record<string, number>) {
  return [{ label: "Escape velocity", value: `${Math.sqrt((2 * 6.674e-11 * p.mass) / p.radius).toFixed(0)} m/s` }];
}
function redshift(p: Record<string, number>) {
  const c = 3e8;
  return [{ label: "z (relativistic)", value: ((p.velocity * 1000) / c).toFixed(4) }];
}
function plate(p: Record<string, number>) {
  return [{ label: "Distance in 1M years", value: `${(p.rate * 1).toFixed(2)} km` }];
}

// Helper to make many similar configs quickly
const cfg = (
  title: string,
  subject: string,
  description: string,
  params: LabConfig["params"],
  compute: LabConfig["compute"],
  notes?: string[],
): LabConfig => ({ title, subject, description, params, compute, notes });

export const LABS: LabConfig[] = [
  cfg("Pendulum Motion", "Physics", "Simple pendulum period as a function of length and gravity.",
    [{ key: "length", label: "Length", min: 0.1, max: 5, step: 0.05, unit: "m", default: 1 }, { key: "gravity", label: "Gravity", min: 1.6, max: 24.8, step: 0.1, unit: "m/s²", default: 9.81 }],
    pendulum, ["Moon g ≈ 1.6", "Earth g ≈ 9.81", "Jupiter g ≈ 24.8"]),
  cfg("Ohm's Law Circuit", "Physics", "Vary voltage and resistance to see current and power.",
    [{ key: "voltage", label: "Voltage", min: 0, max: 240, step: 1, unit: "V", default: 12 }, { key: "resistance", label: "Resistance", min: 1, max: 10000, step: 1, unit: "Ω", default: 100 }],
    ohm),
  cfg("Projectile Motion", "Physics", "Launch angle and speed → range, height and time.",
    [{ key: "velocity", label: "Velocity", min: 1, max: 100, step: 1, unit: "m/s", default: 25 }, { key: "angle", label: "Angle", min: 1, max: 89, step: 1, unit: "°", default: 45 }],
    projectile, ["Maximum range at 45°."]),
  cfg("Quadratic Grapher", "Math", "Roots, discriminant and vertex for ax² + bx + c.",
    [{ key: "a", label: "a", min: -5, max: 5, step: 0.1, default: 1 }, { key: "b", label: "b", min: -10, max: 10, step: 0.1, default: -3 }, { key: "c", label: "c", min: -10, max: 10, step: 0.1, default: 2 }],
    quadratic),
  cfg("Prime Number Sieve", "Math", "Sieve of Eratosthenes up to N.",
    [{ key: "upTo", label: "N", min: 10, max: 5000, step: 10, default: 100 }],
    primes),
  cfg("Newton's Second Law", "Physics", "Force = mass × acceleration.",
    [{ key: "mass", label: "Mass", min: 0.1, max: 1000, step: 0.1, unit: "kg", default: 5 }, { key: "acceleration", label: "Acceleration", min: 0, max: 100, step: 0.1, unit: "m/s²", default: 9.81 }],
    newton2),
  cfg("Kinetic Energy", "Physics", "KE = ½ m v².",
    [{ key: "mass", label: "Mass", min: 0.1, max: 100, step: 0.1, unit: "kg", default: 2 }, { key: "velocity", label: "Velocity", min: 0, max: 100, step: 0.1, unit: "m/s", default: 10 }],
    ke),
  cfg("Potential Energy", "Physics", "PE = m g h.",
    [{ key: "mass", label: "Mass", min: 0.1, max: 100, step: 0.1, unit: "kg", default: 2 }, { key: "height", label: "Height", min: 0, max: 1000, step: 1, unit: "m", default: 10 }],
    pe),
  cfg("Hooke's Law Spring", "Physics", "Spring force and stored elastic energy.",
    [{ key: "k", label: "Spring constant k", min: 1, max: 1000, step: 1, unit: "N/m", default: 100 }, { key: "x", label: "Displacement x", min: 0, max: 1, step: 0.01, unit: "m", default: 0.1 }],
    hooke),
  cfg("Density Lab", "Physics", "ρ = mass / volume.",
    [{ key: "mass", label: "Mass", min: 0.01, max: 1000, step: 0.01, unit: "kg", default: 1 }, { key: "volume", label: "Volume", min: 0.001, max: 1, step: 0.001, unit: "m³", default: 0.001 }],
    density),
  cfg("Pressure", "Physics", "P = F / A.",
    [{ key: "force", label: "Force", min: 1, max: 10000, step: 1, unit: "N", default: 100 }, { key: "area", label: "Area", min: 0.0001, max: 5, step: 0.01, unit: "m²", default: 1 }],
    pressure),
  cfg("Wave Equation", "Physics", "v = f λ.",
    [{ key: "frequency", label: "Frequency", min: 1, max: 20000, step: 1, unit: "Hz", default: 440 }, { key: "wavelength", label: "Wavelength", min: 0.001, max: 10, step: 0.001, unit: "m", default: 0.78 }],
    wave),
  cfg("Lens & Mirror", "Physics", "Thin-lens equation 1/f = 1/dₒ + 1/dᵢ.",
    [{ key: "do", label: "Object distance", min: 0.05, max: 5, step: 0.01, unit: "m", default: 1 }, { key: "di", label: "Image distance", min: 0.05, max: 5, step: 0.01, unit: "m", default: 0.5 }],
    lens),
  cfg("Radioactive Decay", "Physics", "N(t) = N₀ · (½)^(t/T½).",
    [{ key: "n0", label: "Initial atoms N₀", min: 1, max: 1e6, step: 1, default: 1000 }, { key: "halfLife", label: "Half-life", min: 1, max: 1000, step: 1, unit: "s", default: 60 }, { key: "time", label: "Time", min: 0, max: 1000, step: 1, unit: "s", default: 120 }],
    decay),
  cfg("Heat Transfer", "Physics", "Q = m c ΔT.",
    [{ key: "mass", label: "Mass", min: 0.01, max: 100, step: 0.01, unit: "kg", default: 1 }, { key: "c", label: "Specific heat c", min: 100, max: 5000, step: 10, unit: "J/kg·K", default: 4186 }, { key: "dt", label: "ΔT", min: -100, max: 200, step: 1, unit: "K", default: 50 }],
    heatTransfer),
  cfg("Acid-Base pH", "Chemistry", "Adjust pH; see [H+], pOH and nature.",
    [{ key: "h", label: "pH", min: 0, max: 14, step: 0.1, default: 7 }], pH),
  cfg("Molarity Lab", "Chemistry", "M = moles / volume.",
    [{ key: "moles", label: "Moles", min: 0.001, max: 5, step: 0.001, unit: "mol", default: 0.5 }, { key: "volume", label: "Volume", min: 0.01, max: 5, step: 0.01, unit: "L", default: 1 }],
    molarity),
  cfg("Ideal Gas Law", "Chemistry", "PV = nRT (solving for V).",
    [{ key: "P", label: "Pressure", min: 0.1, max: 10, step: 0.1, unit: "atm", default: 1 }, { key: "n", label: "Moles", min: 0.01, max: 10, step: 0.01, unit: "mol", default: 1 }, { key: "T", label: "Temperature", min: 100, max: 1000, step: 1, unit: "K", default: 298 }],
    gas),
  cfg("Punnett Square", "Biology", "Monohybrid cross probabilities.",
    [{ key: "dominantParents", label: "Dominant alleles in parent A (0–2)", min: 0, max: 2, step: 1, default: 1 }],
    punnett),
  cfg("Photosynthesis Lab", "Biology", "Rate depends on light, CO₂ and temperature.",
    [{ key: "light", label: "Light", min: 0, max: 500, step: 1, unit: "µmol/m²/s", default: 200 }, { key: "co2", label: "CO₂", min: 0, max: 1000, step: 1, unit: "ppm", default: 400 }, { key: "temperature", label: "Temperature", min: -10, max: 50, step: 1, unit: "°C", default: 25 }],
    photosynthesis),
  cfg("Cell Surface : Volume", "Biology", "Why cells stay small — SA:V scales as 6/L.",
    [{ key: "size", label: "Cube side length", min: 1, max: 50, step: 1, unit: "µm", default: 10 }], cellSize),
  cfg("Ecosystem Balance", "Biology", "Population dynamics with predators.",
    [{ key: "population", label: "Prey population", min: 0, max: 10000, step: 10, default: 1000 }, { key: "birthRate", label: "Birth rate", min: 0, max: 50, step: 0.5, unit: "%", default: 10 }, { key: "deathRate", label: "Death rate", min: 0, max: 50, step: 0.5, unit: "%", default: 4 }, { key: "predators", label: "Predators", min: 0, max: 1000, step: 1, default: 30 }],
    ecosystem),
  cfg("BMI Calculator", "Biology", "Body Mass Index.",
    [{ key: "mass", label: "Mass", min: 20, max: 200, step: 0.5, unit: "kg", default: 70 }, { key: "height", label: "Height", min: 1, max: 2.5, step: 0.01, unit: "m", default: 1.75 }], bmi),
  cfg("Trigonometry Triangle", "Math", "Compute sin, cos, tan of any angle.",
    [{ key: "angle", label: "Angle", min: -360, max: 360, step: 1, unit: "°", default: 30 }], trig),
  cfg("Law of Cosines", "Math", "Find side c and triangle area.",
    [{ key: "a", label: "Side a", min: 0.1, max: 100, step: 0.1, default: 5 }, { key: "b", label: "Side b", min: 0.1, max: 100, step: 0.1, default: 6 }, { key: "C", label: "Angle C", min: 1, max: 179, step: 1, unit: "°", default: 60 }], triangle),
  cfg("Logarithms", "Math", "log_base(x).",
    [{ key: "base", label: "Base", min: 2, max: 100, step: 1, default: 10 }, { key: "x", label: "x", min: 0.0001, max: 100000, step: 0.0001, default: 1000 }], logb),
  cfg("Number Bases", "Computing", "Decimal ↔ Binary / Octal / Hex.",
    [{ key: "number", label: "Decimal", min: 0, max: 1000000, step: 1, default: 255 }], binary),
  cfg("Modular Arithmetic", "Math", "a mod m.",
    [{ key: "a", label: "a", min: -1000, max: 1000, step: 1, default: 17 }, { key: "m", label: "m", min: 2, max: 100, step: 1, default: 5 }], modular),
  cfg("Set Theory", "Math", "Union, intersection, difference.",
    [{ key: "a", label: "|A|", min: 0, max: 100, step: 1, default: 30 }, { key: "b", label: "|B|", min: 0, max: 100, step: 1, default: 20 }, { key: "intersection", label: "|A ∩ B|", min: 0, max: 100, step: 1, default: 8 }], setTheory),
  cfg("Statistics — Mean & Median", "Math", "Five-number dataset summary.",
    [{ key: "n1", label: "Value 1", min: 0, max: 100, step: 1, default: 4 }, { key: "n2", label: "Value 2", min: 0, max: 100, step: 1, default: 7 }, { key: "n3", label: "Value 3", min: 0, max: 100, step: 1, default: 8 }, { key: "n4", label: "Value 4", min: 0, max: 100, step: 1, default: 12 }, { key: "n5", label: "Value 5", min: 0, max: 100, step: 1, default: 20 }], meanMedian),
  cfg("Probability", "Math", "P = favorable / total.",
    [{ key: "favorable", label: "Favorable", min: 0, max: 100, step: 1, default: 3 }, { key: "total", label: "Total", min: 1, max: 100, step: 1, default: 10 }], probability),
  cfg("Compound Interest", "Math", "Time-value of money.",
    [{ key: "principal", label: "Principal", min: 1, max: 1000000, step: 1, default: 1000 }, { key: "rate", label: "Annual rate", min: 0, max: 30, step: 0.1, unit: "%", default: 5 }, { key: "n", label: "Compoundings/year", min: 1, max: 365, step: 1, default: 12 }, { key: "years", label: "Years", min: 1, max: 50, step: 1, default: 10 }], compound),
  cfg("Earthquake Energy (Richter)", "Earth Science", "Energy ratio of two magnitudes.",
    [{ key: "magnitude", label: "Magnitude", min: 1, max: 10, step: 0.1, default: 6 }], richter),
  cfg("Surface Gravity (Planet)", "Astronomy", "g = G M / r².",
    [{ key: "mass", label: "Planet mass", min: 1e22, max: 2e27, step: 1e22, unit: "kg", default: 5.97e24 }, { key: "radius", label: "Planet radius", min: 1e5, max: 1e8, step: 1e5, unit: "m", default: 6.371e6 }], gravityPlanet),
  cfg("Orbital Period", "Astronomy", "Kepler's third law.",
    [{ key: "radius", label: "Orbit radius", min: 1e6, max: 1e10, step: 1e6, unit: "m", default: 7e6 }, { key: "centralMass", label: "Central mass", min: 1e22, max: 2e30, step: 1e22, unit: "kg", default: 5.97e24 }], orbital),
  cfg("Escape Velocity", "Astronomy", "v = √(2GM/r).",
    [{ key: "mass", label: "Mass", min: 1e22, max: 2e30, step: 1e22, unit: "kg", default: 5.97e24 }, { key: "radius", label: "Radius", min: 1e5, max: 1e9, step: 1e5, unit: "m", default: 6.371e6 }], escapeV),
  cfg("Redshift", "Astronomy", "Simple velocity-based redshift.",
    [{ key: "velocity", label: "Recession velocity", min: 0, max: 300000, step: 1, unit: "km/s", default: 30000 }], redshift),
  cfg("Plate Tectonics", "Earth Science", "Cumulative drift of a tectonic plate.",
    [{ key: "rate", label: "Drift rate", min: 0.1, max: 20, step: 0.1, unit: "cm/yr", default: 5 }], plate),
  cfg("Logic Gates Truth Table", "Computing", "AND/OR/XOR of two bits.",
    [{ key: "a", label: "A (0 or 1)", min: 0, max: 1, step: 1, default: 1 }, { key: "b", label: "B (0 or 1)", min: 0, max: 1, step: 1, default: 0 }],
    (p) => [{ label: "AND", value: String(p.a & p.b) }, { label: "OR", value: String(p.a | p.b) }, { label: "XOR", value: String(p.a ^ p.b) }, { label: "NAND", value: String(1 - (p.a & p.b)) }]),
  cfg("Big-O Cost", "Computing", "Operations vs input size n.",
    [{ key: "n", label: "n", min: 1, max: 100000, step: 1, default: 1000 }],
    (p) => [{ label: "O(n)", value: p.n.toLocaleString() }, { label: "O(n log n)", value: Math.round(p.n * Math.log2(p.n)).toLocaleString() }, { label: "O(n²)", value: (p.n * p.n).toLocaleString() }, { label: "O(2ⁿ)", value: p.n < 30 ? Math.pow(2, p.n).toLocaleString() : "huge" }]),
  cfg("Sorting — Comparisons", "Computing", "Worst-case comparisons.",
    [{ key: "n", label: "n", min: 2, max: 1000, step: 1, default: 100 }],
    (p) => [{ label: "Bubble sort O(n²)", value: (p.n * (p.n - 1) / 2).toLocaleString() }, { label: "Merge sort O(n log n)", value: Math.round(p.n * Math.log2(p.n)).toLocaleString() }]),
  cfg("Cryptography — Caesar shift", "Computing", "Try shifts to crack the cipher.",
    [{ key: "shift", label: "Shift", min: 0, max: 25, step: 1, default: 3 }],
    (p) => {
      const text = "Hello World";
      const out = text.replace(/[a-z]/gi, (ch) => {
        const base = ch <= "Z" ? 65 : 97;
        return String.fromCharCode(((ch.charCodeAt(0) - base + p.shift) % 26 + 26) % 26 + base);
      });
      return [{ label: `"Hello World" + ${p.shift}`, value: out }];
    }),
  cfg("Sound Decibels", "Physics", "dB from intensity ratio.",
    [{ key: "intensity", label: "Intensity", min: 1e-12, max: 1, step: 1e-12, unit: "W/m²", default: 1e-6 }],
    (p) => [{ label: "Sound level", value: `${(10 * Math.log10(p.intensity / 1e-12)).toFixed(1)} dB` }]),
  cfg("Refraction (Snell)", "Physics", "n₁ sin θ₁ = n₂ sin θ₂.",
    [{ key: "n1", label: "n₁", min: 1, max: 2.5, step: 0.01, default: 1 }, { key: "n2", label: "n₂", min: 1, max: 2.5, step: 0.01, default: 1.33 }, { key: "theta1", label: "θ₁", min: 0, max: 89, step: 1, unit: "°", default: 30 }],
    (p) => {
      const s = (p.n1 * Math.sin((p.theta1 * PI) / 180)) / p.n2;
      return [{ label: "θ₂", value: Math.abs(s) <= 1 ? `${((Math.asin(s) * 180) / PI).toFixed(2)} °` : "TIR" }];
    }),
  cfg("Mass-Energy E=mc²", "Physics", "Rest energy of matter.",
    [{ key: "mass", label: "Mass", min: 0.000001, max: 1, step: 0.000001, unit: "kg", default: 0.001 }],
    (p) => [{ label: "Energy", value: `${(p.mass * 9e16).toExponential(3)} J` }]),
  cfg("Friction Force", "Physics", "f = µN.",
    [{ key: "mu", label: "Coefficient µ", min: 0, max: 1.5, step: 0.01, default: 0.3 }, { key: "normal", label: "Normal force N", min: 0, max: 1000, step: 1, unit: "N", default: 100 }],
    (p) => [{ label: "Friction force", value: `${(p.mu * p.normal).toFixed(2)} N` }]),
  cfg("Centripetal Force", "Physics", "F = m v² / r.",
    [{ key: "mass", label: "Mass", min: 0.1, max: 100, step: 0.1, unit: "kg", default: 1 }, { key: "velocity", label: "Velocity", min: 0, max: 100, step: 0.1, unit: "m/s", default: 5 }, { key: "radius", label: "Radius", min: 0.1, max: 100, step: 0.1, unit: "m", default: 2 }],
    (p) => [{ label: "Centripetal force", value: `${((p.mass * p.velocity ** 2) / p.radius).toFixed(2)} N` }]),
  cfg("Momentum & Impulse", "Physics", "p = m v ; J = F t.",
    [{ key: "mass", label: "Mass", min: 0.1, max: 100, step: 0.1, unit: "kg", default: 2 }, { key: "velocity", label: "Velocity", min: 0, max: 100, step: 0.1, unit: "m/s", default: 8 }, { key: "force", label: "Force", min: 0, max: 1000, step: 1, unit: "N", default: 50 }, { key: "time", label: "Time", min: 0, max: 10, step: 0.1, unit: "s", default: 1 }],
    (p) => [{ label: "Momentum p", value: `${(p.mass * p.velocity).toFixed(2)} kg·m/s` }, { label: "Impulse J", value: `${(p.force * p.time).toFixed(2)} N·s` }]),
  cfg("Coulomb's Law", "Physics", "F = k q₁ q₂ / r².",
    [{ key: "q1", label: "q₁ (µC)", min: -100, max: 100, step: 0.1, default: 1 }, { key: "q2", label: "q₂ (µC)", min: -100, max: 100, step: 0.1, default: 1 }, { key: "r", label: "r (m)", min: 0.01, max: 10, step: 0.01, default: 0.1 }],
    (p) => [{ label: "Force", value: `${((8.99e9 * p.q1 * 1e-6 * p.q2 * 1e-6) / (p.r * p.r)).toExponential(3)} N` }]),
  cfg("Resistor — Power", "Physics", "P = I² R = V²/R.",
    [{ key: "current", label: "Current I", min: 0, max: 10, step: 0.01, unit: "A", default: 1 }, { key: "resistance", label: "Resistance R", min: 1, max: 1000, step: 1, unit: "Ω", default: 100 }],
    (p) => [{ label: "P = I²R", value: `${(p.current ** 2 * p.resistance).toFixed(2)} W` }, { label: "V = IR", value: `${(p.current * p.resistance).toFixed(2)} V` }]),
  cfg("Temperature Converter", "Physics", "C ↔ F ↔ K.",
    [{ key: "celsius", label: "Celsius", min: -273, max: 1000, step: 1, unit: "°C", default: 25 }],
    (p) => [{ label: "Fahrenheit", value: `${(p.celsius * 9 / 5 + 32).toFixed(2)} °F` }, { label: "Kelvin", value: `${(p.celsius + 273.15).toFixed(2)} K` }]),
  cfg("Speed = Distance / Time", "Physics", "Average speed.",
    [{ key: "distance", label: "Distance", min: 0, max: 10000, step: 1, unit: "m", default: 100 }, { key: "time", label: "Time", min: 0.1, max: 1000, step: 0.1, unit: "s", default: 10 }],
    (p) => [{ label: "Speed", value: `${(p.distance / p.time).toFixed(3)} m/s` }, { label: "= km/h", value: `${(p.distance / p.time * 3.6).toFixed(2)} km/h` }]),
  cfg("Acceleration", "Physics", "a = (v - u) / t.",
    [{ key: "u", label: "Initial velocity", min: -100, max: 100, step: 0.1, unit: "m/s", default: 0 }, { key: "v", label: "Final velocity", min: -100, max: 100, step: 0.1, unit: "m/s", default: 20 }, { key: "t", label: "Time", min: 0.1, max: 60, step: 0.1, unit: "s", default: 4 }],
    (p) => [{ label: "Acceleration", value: `${((p.v - p.u) / p.t).toFixed(3)} m/s²` }]),
  cfg("Levers (Simple Machines)", "Physics", "Mechanical advantage of a lever.",
    [{ key: "effortArm", label: "Effort arm", min: 0.01, max: 5, step: 0.01, unit: "m", default: 1 }, { key: "loadArm", label: "Load arm", min: 0.01, max: 5, step: 0.01, unit: "m", default: 0.2 }, { key: "effort", label: "Effort force", min: 0, max: 1000, step: 1, unit: "N", default: 50 }],
    (p) => [{ label: "Mechanical advantage", value: (p.effortArm / p.loadArm).toFixed(2) }, { label: "Max load", value: `${(p.effort * p.effortArm / p.loadArm).toFixed(2)} N` }]),
  cfg("Pulley System", "Physics", "Force needed with n supporting ropes.",
    [{ key: "load", label: "Load", min: 0, max: 10000, step: 1, unit: "N", default: 1000 }, { key: "ropes", label: "Supporting ropes", min: 1, max: 10, step: 1, default: 4 }],
    (p) => [{ label: "Effort force", value: `${(p.load / p.ropes).toFixed(2)} N` }, { label: "Mechanical advantage", value: p.ropes.toFixed(0) }]),
  cfg("Reaction Rate", "Chemistry", "Arrhenius-style temperature effect.",
    [{ key: "T", label: "Temperature", min: 250, max: 800, step: 1, unit: "K", default: 298 }, { key: "Ea", label: "Activation energy", min: 10, max: 200, step: 1, unit: "kJ/mol", default: 60 }],
    (p) => [{ label: "Relative rate", value: Math.exp(-((p.Ea * 1000) / 8.314 / p.T)).toExponential(3) }]),
  cfg("Buoyancy", "Physics", "Archimedes: F = ρ V g.",
    [{ key: "density", label: "Fluid density", min: 100, max: 14000, step: 10, unit: "kg/m³", default: 1000 }, { key: "volume", label: "Submerged volume", min: 0.0001, max: 1, step: 0.0001, unit: "m³", default: 0.01 }],
    (p) => [{ label: "Buoyant force", value: `${(p.density * p.volume * 9.81).toFixed(2)} N` }]),
  cfg("Solar Panel Output", "Engineering", "P = η · A · irradiance.",
    [{ key: "efficiency", label: "Efficiency", min: 1, max: 30, step: 0.1, unit: "%", default: 20 }, { key: "area", label: "Area", min: 0.1, max: 100, step: 0.1, unit: "m²", default: 2 }, { key: "irradiance", label: "Irradiance", min: 100, max: 1200, step: 10, unit: "W/m²", default: 1000 }],
    (p) => [{ label: "Power", value: `${(p.efficiency / 100 * p.area * p.irradiance).toFixed(1)} W` }]),
  cfg("Loan Payment", "Math", "Monthly payment for a fixed-rate loan.",
    [{ key: "principal", label: "Loan amount", min: 100, max: 1000000, step: 100, default: 10000 }, { key: "rate", label: "Annual rate", min: 0.1, max: 30, step: 0.1, unit: "%", default: 8 }, { key: "years", label: "Years", min: 1, max: 30, step: 1, default: 5 }],
    (p) => {
      const i = p.rate / 100 / 12, n = p.years * 12;
      const m = (p.principal * i) / (1 - Math.pow(1 + i, -n));
      return [{ label: "Monthly payment", value: m.toFixed(2) }, { label: "Total paid", value: (m * n).toFixed(2) }, { label: "Total interest", value: (m * n - p.principal).toFixed(2) }];
    }),
];