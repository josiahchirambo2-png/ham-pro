import { useMemo } from "react";

/**
 * Lightweight CSS-3D scenes for labs. Picks a scene from the lab title/subject
 * so every lab gets a relevant three-dimensional diagram without external libs.
 */
export function Lab3D({ title, subject, params }: { title: string; subject: string; params: Record<string, number> }) {
  const scene = useMemo(() => pickScene(title, subject), [title, subject]);
  return (
    <div className="lab3d-stage" aria-hidden>
      <div className="lab3d-world">
        {scene === "pendulum" && <PendulumScene p={params} />}
        {scene === "circuit" && <CircuitScene />}
        {scene === "projectile" && <ProjectileScene p={params} />}
        {scene === "wave" && <WaveScene />}
        {scene === "atom" && <AtomScene />}
        {scene === "molecule" && <MoleculeScene />}
        {scene === "beaker" && <BeakerScene />}
        {scene === "cell" && <CellScene />}
        {scene === "planet" && <PlanetScene />}
        {scene === "magnet" && <MagnetScene />}
        {scene === "spring" && <SpringScene />}
        {scene === "lens" && <LensScene />}
        {scene === "graph" && <GraphScene />}
        {scene === "cube" && <CubeScene />}
        {scene === "dna" && <DnaScene />}
      </div>
    </div>
  );
}

function pickScene(title: string, subject: string): string {
  const s = (title + " " + subject).toLowerCase();
  if (/pendul|oscill|period/.test(s)) return "pendulum";
  if (/ohm|circuit|resist|current|voltage/.test(s)) return "circuit";
  if (/project|trajec|launch|ballist/.test(s)) return "projectile";
  if (/wave|sound|frequency|sine/.test(s)) return "wave";
  if (/atom|electron|orbital|hydrogen|bohr/.test(s)) return "atom";
  if (/molec|bond|reaction|titrat|ph |acid|base|chem/.test(s)) return "molecule";
  if (/beaker|solution|concentr|density|fluid|pressure/.test(s)) return "beaker";
  if (/cell|mito|bio|photo|plant|animal|tissue/.test(s)) return "cell";
  if (/planet|orbit|gravit|kepler|space|astro/.test(s)) return "planet";
  if (/magnet|field|flux|induct/.test(s)) return "magnet";
  if (/spring|hooke|elastic/.test(s)) return "spring";
  if (/lens|optic|mirror|light|refract|reflect/.test(s)) return "lens";
  if (/graph|function|quadrat|polynom|algebra|calc|prime|sigma|sum/.test(s)) return "graph";
  if (/dna|gene|rna|protein/.test(s)) return "dna";
  return "cube";
}

/* ---------------- Scenes ---------------- */

function PendulumScene({ p }: { p: Record<string, number> }) {
  const len = Math.min(120, 50 + (p.length ?? 1) * 20);
  const speed = Math.max(0.4, 2 / Math.sqrt(p.length ?? 1));
  return (
    <div className="lab3d-pend" style={{ ["--len" as any]: `${len}px`, ["--spd" as any]: `${speed}s` }}>
      <div className="lab3d-pend-pivot" />
      <div className="lab3d-pend-arm">
        <div className="lab3d-pend-rope" />
        <div className="lab3d-pend-bob" />
      </div>
    </div>
  );
}

function CircuitScene() {
  return (
    <div className="lab3d-circuit">
      <div className="lab3d-battery" />
      <div className="lab3d-wire lab3d-wire-top" />
      <div className="lab3d-wire lab3d-wire-right" />
      <div className="lab3d-wire lab3d-wire-bottom" />
      <div className="lab3d-wire lab3d-wire-left" />
      <div className="lab3d-bulb"><span /></div>
      <div className="lab3d-electrons">
        {Array.from({ length: 6 }).map((_, i) => <span key={i} style={{ animationDelay: `${i * 0.4}s` }} />)}
      </div>
    </div>
  );
}

function ProjectileScene({ p }: { p: Record<string, number> }) {
  const angle = p.angle ?? 45;
  return (
    <div className="lab3d-proj">
      <div className="lab3d-ground" />
      <div className="lab3d-cannon" style={{ transform: `rotate(${-angle}deg)` }} />
      <div className="lab3d-ball" style={{ ["--ang" as any]: `${angle}deg` }} />
    </div>
  );
}

function WaveScene() {
  return (
    <svg viewBox="0 0 200 100" className="lab3d-wave" preserveAspectRatio="none">
      <defs>
        <linearGradient id="wg" x1="0" x2="1">
          <stop offset="0" stopColor="oklch(0.7 0.18 60)" />
          <stop offset="1" stopColor="oklch(0.6 0.18 200)" />
        </linearGradient>
      </defs>
      {[0, 1, 2].map((i) => (
        <path key={i} d="M0,50 Q25,10 50,50 T100,50 T150,50 T200,50" fill="none" stroke="url(#wg)" strokeWidth={2 - i * 0.4} opacity={1 - i * 0.3}>
          <animate attributeName="d" dur={`${2 + i}s`} repeatCount="indefinite"
            values="M0,50 Q25,10 50,50 T100,50 T150,50 T200,50;
                    M0,50 Q25,90 50,50 T100,50 T150,50 T200,50;
                    M0,50 Q25,10 50,50 T100,50 T150,50 T200,50" />
        </path>
      ))}
    </svg>
  );
}

function AtomScene() {
  return (
    <div className="lab3d-atom">
      <div className="lab3d-nucleus" />
      <div className="lab3d-orbit lab3d-o1"><span /></div>
      <div className="lab3d-orbit lab3d-o2"><span /></div>
      <div className="lab3d-orbit lab3d-o3"><span /></div>
    </div>
  );
}

function MoleculeScene() {
  return (
    <div className="lab3d-mol">
      <div className="lab3d-mol-spin">
        <div className="lab3d-mol-bond" />
        <div className="lab3d-mol-bond lab3d-mol-bond-2" />
        <div className="lab3d-mol-atom lab3d-mol-c" />
        <div className="lab3d-mol-atom lab3d-mol-h1" />
        <div className="lab3d-mol-atom lab3d-mol-h2" />
        <div className="lab3d-mol-atom lab3d-mol-o" />
      </div>
    </div>
  );
}

function BeakerScene() {
  return (
    <div className="lab3d-beaker">
      <div className="lab3d-beaker-glass">
        <div className="lab3d-liquid" />
        <div className="lab3d-bubble" style={{ left: "20%", animationDelay: "0s" }} />
        <div className="lab3d-bubble" style={{ left: "50%", animationDelay: "0.8s" }} />
        <div className="lab3d-bubble" style={{ left: "75%", animationDelay: "1.4s" }} />
      </div>
    </div>
  );
}

function CellScene() {
  return (
    <div className="lab3d-cell">
      <div className="lab3d-cell-membrane" />
      <div className="lab3d-cell-nucleus" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="lab3d-organelle" style={{ ["--i" as any]: i }} />
      ))}
    </div>
  );
}

function PlanetScene() {
  return (
    <div className="lab3d-planet">
      <div className="lab3d-sun" />
      <div className="lab3d-orbit-ring lab3d-or1"><span /></div>
      <div className="lab3d-orbit-ring lab3d-or2"><span /></div>
    </div>
  );
}

function MagnetScene() {
  return (
    <div className="lab3d-magnet">
      <div className="lab3d-bar" />
      <svg viewBox="-100 -60 200 120" className="lab3d-field">
        {[20, 35, 50, 65, 80].map((r, i) => (
          <ellipse key={i} cx="0" cy="0" rx={r} ry={r * 0.55} fill="none" stroke="oklch(0.75 0.15 75)" strokeWidth="1" opacity={0.7 - i * 0.1}>
            <animate attributeName="stroke-dashoffset" from="0" to="40" dur="3s" repeatCount="indefinite" />
            <set attributeName="stroke-dasharray" to="6 4" />
          </ellipse>
        ))}
      </svg>
    </div>
  );
}

function SpringScene() {
  return (
    <div className="lab3d-spring">
      <div className="lab3d-spring-wall" />
      <svg viewBox="0 0 200 60" className="lab3d-spring-coil">
        <path d="M10,30 Q20,5 30,30 T50,30 T70,30 T90,30 T110,30 T130,30 T150,30" fill="none" stroke="oklch(0.78 0.14 75)" strokeWidth="3" />
      </svg>
      <div className="lab3d-spring-mass" />
    </div>
  );
}

function LensScene() {
  return (
    <div className="lab3d-lens">
      <div className="lab3d-ray lab3d-ray-1" />
      <div className="lab3d-ray lab3d-ray-2" />
      <div className="lab3d-ray lab3d-ray-3" />
      <div className="lab3d-lens-glass" />
    </div>
  );
}

function GraphScene() {
  return (
    <svg viewBox="-100 -60 200 120" className="lab3d-graph">
      <defs>
        <linearGradient id="gg" x1="0" x2="1"><stop offset="0" stopColor="oklch(0.75 0.15 75)" /><stop offset="1" stopColor="oklch(0.6 0.18 200)" /></linearGradient>
      </defs>
      <line x1="-90" y1="0" x2="90" y2="0" stroke="oklch(0.6 0 0 / 0.4)" />
      <line x1="0" y1="-50" x2="0" y2="50" stroke="oklch(0.6 0 0 / 0.4)" />
      <path d="M-80,40 Q0,-80 80,40" fill="none" stroke="url(#gg)" strokeWidth="2.5" />
      <circle r="3" fill="oklch(0.75 0.15 75)">
        <animateMotion dur="4s" repeatCount="indefinite" path="M-80,40 Q0,-80 80,40" />
      </circle>
    </svg>
  );
}

function CubeScene() {
  return (
    <div className="lab3d-cube">
      {["front", "back", "right", "left", "top", "bottom"].map((f) => (
        <div key={f} className={`lab3d-cube-face lab3d-cube-${f}`} />
      ))}
    </div>
  );
}

function DnaScene() {
  return (
    <div className="lab3d-dna">
      {Array.from({ length: 14 }).map((_, i) => (
        <div key={i} className="lab3d-dna-rung" style={{ ["--i" as any]: i }}>
          <span /><i /><span />
        </div>
      ))}
    </div>
  );
}