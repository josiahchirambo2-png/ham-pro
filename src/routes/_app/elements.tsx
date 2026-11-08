import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Atom, FlaskConical, Calculator, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/elements")({
  head: () => ({
    meta: [
      { title: "Elements — KIT AI" },
      { name: "description", content: "Interactive periodic table with all 118 elements, atom shells and a molar mass calculator." },
      { property: "og:title", content: "Elements — KIT AI" },
      { property: "og:description", content: "Explore all 118 elements visually and calculate molar mass instantly." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ElementsPage,
});

const RAW =
  "H Hydrogen 1.008|He Helium 4.0026|Li Lithium 6.94|Be Beryllium 9.0122|B Boron 10.81|C Carbon 12.011|N Nitrogen 14.007|O Oxygen 15.999|F Fluorine 18.998|Ne Neon 20.180|Na Sodium 22.990|Mg Magnesium 24.305|Al Aluminium 26.982|Si Silicon 28.085|P Phosphorus 30.974|S Sulfur 32.06|Cl Chlorine 35.45|Ar Argon 39.948|K Potassium 39.098|Ca Calcium 40.078|Sc Scandium 44.956|Ti Titanium 47.867|V Vanadium 50.942|Cr Chromium 51.996|Mn Manganese 54.938|Fe Iron 55.845|Co Cobalt 58.933|Ni Nickel 58.693|Cu Copper 63.546|Zn Zinc 65.38|Ga Gallium 69.723|Ge Germanium 72.630|As Arsenic 74.922|Se Selenium 78.971|Br Bromine 79.904|Kr Krypton 83.798|Rb Rubidium 85.468|Sr Strontium 87.62|Y Yttrium 88.906|Zr Zirconium 91.224|Nb Niobium 92.906|Mo Molybdenum 95.95|Tc Technetium 98|Ru Ruthenium 101.07|Rh Rhodium 102.91|Pd Palladium 106.42|Ag Silver 107.87|Cd Cadmium 112.41|In Indium 114.82|Sn Tin 118.71|Sb Antimony 121.76|Te Tellurium 127.60|I Iodine 126.90|Xe Xenon 131.29|Cs Caesium 132.91|Ba Barium 137.33|La Lanthanum 138.91|Ce Cerium 140.12|Pr Praseodymium 140.91|Nd Neodymium 144.24|Pm Promethium 145|Sm Samarium 150.36|Eu Europium 151.96|Gd Gadolinium 157.25|Tb Terbium 158.93|Dy Dysprosium 162.50|Ho Holmium 164.93|Er Erbium 167.26|Tm Thulium 168.93|Yb Ytterbium 173.05|Lu Lutetium 174.97|Hf Hafnium 178.49|Ta Tantalum 180.95|W Tungsten 183.84|Re Rhenium 186.21|Os Osmium 190.23|Ir Iridium 192.22|Pt Platinum 195.08|Au Gold 196.97|Hg Mercury 200.59|Tl Thallium 204.38|Pb Lead 207.2|Bi Bismuth 208.98|Po Polonium 209|At Astatine 210|Rn Radon 222|Fr Francium 223|Ra Radium 226|Ac Actinium 227|Th Thorium 232.04|Pa Protactinium 231.04|U Uranium 238.03|Np Neptunium 237|Pu Plutonium 244|Am Americium 243|Cm Curium 247|Bk Berkelium 247|Cf Californium 251|Es Einsteinium 252|Fm Fermium 257|Md Mendelevium 258|No Nobelium 259|Lr Lawrencium 266|Rf Rutherfordium 267|Db Dubnium 268|Sg Seaborgium 269|Bh Bohrium 270|Hs Hassium 277|Mt Meitnerium 278|Ds Darmstadtium 281|Rg Roentgenium 282|Cn Copernicium 285|Nh Nihonium 286|Fl Flerovium 289|Mc Moscovium 290|Lv Livermorium 293|Ts Tennessine 294|Og Oganesson 294";

const CATS =
  "ng" + "aemnnnhg" + "aepmnnhg" + "ae" + "t".repeat(10) + "pmmnhg" + "ae" + "t".repeat(10) + "ppmmhg" +
  "ae" + "l".repeat(15) + "t".repeat(9) + "pppphg" + "ae" + "c".repeat(15) + "t".repeat(9) + "pppphg";

const CAT_LABEL: Record<string, string> = {
  n: "Nonmetal", g: "Noble gas", a: "Alkali metal", e: "Alkaline earth", t: "Transition metal",
  p: "Post-transition", m: "Metalloid", h: "Halogen", l: "Lanthanide", c: "Actinide",
};

type El = { z: number; sym: string; name: string; mass: number; cat: string; row: number; col: number; period: number };

function position(z: number): [number, number, number] {
  if (z === 1) return [1, 1, 1];
  if (z === 2) return [1, 18, 1];
  const starts = [3, 11, 19, 37, 55, 87];
  const p = starts.filter((s) => z >= s).length + 1;
  const s = starts[p - 2];
  const i = z - s;
  if (p <= 3) return [p, i < 2 ? i + 1 : i + 11, p];
  if (p <= 5) return [p, i + 1, p];
  if (i < 2) return [p, i + 1, p];
  if (i < 17) return [p + 3, i + 1, p]; // f-block rows 9/10, cols 3..17
  return [p, i - 13, p];
}

const ELEMENTS: El[] = RAW.split("|").map((r, idx) => {
  const [sym, name, m] = r.split(" ");
  const z = idx + 1;
  const [row, col, period] = position(z);
  return { z, sym, name, mass: parseFloat(m), cat: CATS[idx], row, col, period };
});

function shells(z: number): number[] {
  const caps = [2, 8, 18, 32, 32, 18, 8];
  const order = [[1,2],[2,2],[2,6],[3,2],[3,6],[4,2],[3,10],[4,6],[5,2],[4,10],[5,6],[6,2],[4,14],[5,10],[6,6],[7,2],[5,14],[6,10],[7,6]];
  const out = [0, 0, 0, 0, 0, 0, 0];
  let left = z;
  for (const [n, c] of order) { const take = Math.min(c, left); out[n - 1] += take; left -= take; if (!left) break; }
  return out.filter((v, i) => v > 0 && v <= caps[i]);
}

function molarMass(formula: string): number | null {
  const bySym = new Map(ELEMENTS.map((e) => [e.sym, e.mass]));
  let i = 0;
  function group(): number | null {
    let total = 0;
    while (i < formula.length && formula[i] !== ")") {
      let part: number | null;
      if (formula[i] === "(") { i++; part = group(); if (formula[i] !== ")") return null; i++; }
      else {
        const m = /^[A-Z][a-z]?/.exec(formula.slice(i)); if (!m) return null;
        part = bySym.get(m[0]) ?? null; i += m[0].length;
      }
      if (part === null) return null;
      const n = /^\d+/.exec(formula.slice(i)); if (n) i += n[0].length;
      total += part * (n ? parseInt(n[0]) : 1);
    }
    return total;
  }
  const r = group();
  return i === formula.length && r ? r : null;
}

function ElementsPage() {
  const [sel, setSel] = useState<El | null>(null);
  const [q, setQ] = useState("");
  const [hoverCat, setHoverCat] = useState<string | null>(null);
  const [formula, setFormula] = useState("H2O");
  const mm = useMemo(() => molarMass(formula.replace(/\s/g, "")), [formula]);
  const match = (e: El) => {
    const s = q.trim().toLowerCase();
    if (hoverCat && e.cat !== hoverCat) return false;
    return !s || e.name.toLowerCase().includes(s) || e.sym.toLowerCase() === s || String(e.z) === s;
  };

  return (
    <div className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
        <div className="absolute -top-32 -left-32 size-[28rem] rounded-full blur-3xl" style={{ background: "var(--aurora-1)" }} />
        <div className="absolute top-20 -right-40 size-[30rem] rounded-full blur-3xl" style={{ background: "var(--aurora-2)" }} />
        <div className="absolute -bottom-40 left-1/3 size-[26rem] rounded-full blur-3xl" style={{ background: "var(--aurora-3)" }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-10">
        <section className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs backdrop-blur">
            <Atom className="size-3.5" /> KIT Elements
          </span>
          <h1 className="mt-5 text-4xl md:text-6xl font-bold tracking-tight">Chemistry you can see.</h1>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">Every element, colour-coded, with atom shells and instant details. Stop memorising — start visualising.</p>
          <div className="mt-6 flex justify-center gap-10 text-sm">
            <div><b className="text-2xl block">118</b><span className="text-muted-foreground">Elements</span></div>
            <div><b className="text-2xl block">10</b><span className="text-muted-foreground">Families</span></div>
            <div><b className="text-2xl block">7</b><span className="text-muted-foreground">Periods</span></div>
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-border bg-background/60 p-4 md:p-6 backdrop-blur-xl shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="size-4 absolute left-3 top-3 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search name, symbol or number" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(CAT_LABEL).map(([k, v]) => (
                <button key={k} onMouseEnter={() => setHoverCat(k)} onMouseLeave={() => setHoverCat(null)}
                  onClick={() => setHoverCat(hoverCat === k ? null : k)}
                  className="rounded-full px-2.5 py-1 text-[11px] font-medium text-foreground border border-border"
                  style={{ background: `var(--el-${k})` }}>{v}</button>
              ))}
            </div>
          </div>

          <div className="mt-5 overflow-x-auto no-scrollbar">
            <div className="grid gap-1 min-w-[900px]" style={{ gridTemplateColumns: "repeat(18, minmax(0, 1fr))", gridTemplateRows: "repeat(7, auto) 12px repeat(2, auto)" }}>
              {ELEMENTS.map((e) => (
                <button key={e.z} onClick={() => setSel(e)}
                  className={`aspect-square rounded-lg p-1 text-left text-foreground transition hover:scale-110 hover:z-10 hover:shadow-lg ${match(e) ? "" : "opacity-20"}`}
                  style={{ gridRow: e.row > 7 ? e.row + 1 : e.row, gridColumn: e.col, background: `var(--el-${e.cat})` }}
                  title={e.name}>
                  <span className="block text-[9px] leading-none opacity-70">{e.z}</span>
                  <span className="block text-center text-base font-bold leading-tight">{e.sym}</span>
                  <span className="block text-center text-[8px] leading-none truncate opacity-80">{e.name}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10 grid md:grid-cols-2 gap-4">
          <div className="rounded-3xl border border-border bg-background/60 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-2 font-semibold"><Calculator className="size-4" /> Molar Mass</div>
            <p className="text-sm text-muted-foreground mt-1">Type a formula like Ca(OH)2 or C6H12O6.</p>
            <Input className="mt-3 font-mono" value={formula} onChange={(e) => setFormula(e.target.value)} />
            <p className="mt-3 text-2xl font-bold">{mm ? `${mm.toFixed(3)} g/mol` : <span className="text-base text-muted-foreground">Check the formula</span>}</p>
          </div>
          <div className="rounded-3xl border border-border bg-background/60 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-2 font-semibold"><FlaskConical className="size-4" /> How to read it</div>
            <ul className="mt-2 text-sm text-muted-foreground space-y-1.5 list-disc pl-4">
              <li>Rows are periods — the number of electron shells.</li>
              <li>Columns are groups — elements with similar behaviour.</li>
              <li>Tap any tile to see its atom and key facts.</li>
            </ul>
          </div>
        </section>
      </div>

      {sel && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/60 backdrop-blur p-4" onClick={() => setSel(null)}>
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="size-20 rounded-2xl grid place-items-center text-3xl font-bold text-foreground" style={{ background: `var(--el-${sel.cat})` }}>{sel.sym}</div>
                <div>
                  <h2 className="text-2xl font-bold">{sel.name}</h2>
                  <p className="text-sm text-muted-foreground">{CAT_LABEL[sel.cat]}</p>
                </div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setSel(null)}><X className="size-4" /></Button>
            </div>
            <AtomModel z={sel.z} sym={sel.sym} />
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-xl bg-muted p-2"><b className="block">{sel.z}</b>Atomic no.</div>
              <div className="rounded-xl bg-muted p-2"><b className="block">{sel.mass}</b>Mass (u)</div>
              <div className="rounded-xl bg-muted p-2"><b className="block">{sel.period}</b>Period</div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground text-center">Shells: {shells(sel.z).join(", ")}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function AtomModel({ z, sym }: { z: number; sym: string }) {
  const sh = shells(z);
  return (
    <svg viewBox="-110 -110 220 220" className="mx-auto my-4 size-56 text-primary">
      <circle r="14" fill="currentColor" />
      <text y="4" textAnchor="middle" className="fill-primary-foreground text-[10px] font-bold">{sym}</text>
      {sh.map((n, i) => {
        const r = 26 + i * 12;
        return (
          <g key={i} className="animate-spin" style={{ transformOrigin: "0 0", animationDuration: `${8 + i * 4}s` }}>
            <circle r={r} fill="none" stroke="currentColor" strokeOpacity="0.25" />
            {Array.from({ length: n }).map((_, j) => {
              const a = (j / n) * Math.PI * 2;
              return <circle key={j} cx={Math.cos(a) * r} cy={Math.sin(a) * r} r="2.6" fill="currentColor" />;
            })}
          </g>
        );
      })}
    </svg>
  );
}
