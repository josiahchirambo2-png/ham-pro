import { createFileRoute } from "@tanstack/react-router";
import { FlaskConical, Atom, Calculator, Dna, Cpu, Waves, Magnet, Beaker, CircuitBoard, Microscope, Leaf, Triangle, Sigma, Binary, Globe, Zap, Telescope, Bug, FlaskRound, Brain } from "lucide-react";

export const Route = createFileRoute("/_authenticated/labs")({
  head: () => ({ meta: [{ title: "Interactive Labs — HAM PRO" }] }),
  component: Labs,
});

const ICONS = [Atom, Calculator, Dna, Cpu, Waves, Magnet, Beaker, CircuitBoard, Microscope, Leaf, Triangle, Sigma, Binary, Globe, Zap, Telescope, Bug, FlaskRound, Brain, FlaskConical];

const LABS = [
  { t: "Pendulum Motion", s: "Physics", live: true },
  { t: "Ohm's Law Circuit", s: "Physics", live: true },
  { t: "Quadratic Grapher", s: "Math", live: true },
  { t: "Prime Number Sieve", s: "Math", live: true },
  { t: "DNA Base Pairing", s: "Biology", live: true },
  ...[
    "Projectile Motion", "Newton's Cradle", "Wave Interference", "Lens & Mirrors", "Sound Frequency",
    "Electromagnetic Induction", "Acid-Base Titration", "Periodic Table Explorer", "Molecular Builder", "Reaction Rates",
    "Photosynthesis Lab", "Mitosis vs Meiosis", "Heart Circulatory Sim", "Ecosystem Balance", "Genetics Punnett Square",
    "Linear Algebra Vectors", "Calculus Derivatives", "Statistics Histogram", "Probability Dice", "Trigonometry Triangle",
    "Logic Gates Builder", "Binary Converter", "Sorting Algorithms", "Pathfinding Visualizer", "Boolean Algebra",
    "Earth Layers Model", "Plate Tectonics", "Weather Patterns", "Solar System Sim", "Star Lifecycle",
    "Atomic Orbital Viewer", "Radioactive Decay", "Heat Transfer Sim", "Pressure & Volume", "Buoyancy Lab",
    "Friction & Forces", "Energy Conservation", "Spring Hooke's Law", "Simple Machines", "Lever & Pulleys",
    "Chemical Bonding", "Organic Functional Groups", "pH Indicators", "Solubility Lab", "Electroplating",
    "Cell Structure", "Microorganisms", "Human Skeleton", "Nervous System", "Plant Anatomy",
    "Probability Trees", "Graph Theory", "Set Theory", "Number Bases", "Modular Arithmetic",
  ].map((t) => ({ t, s: "Mixed", live: false })),
];

function Labs() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold flex items-center gap-2"><FlaskConical className="text-primary" /> Interactive Labs</h1>
      <p className="text-muted-foreground mt-1">{LABS.length}+ hands-on simulations across sciences, math and computing.</p>
      <div className="mt-6 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {LABS.map((l, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <div key={l.t} className="rounded-xl border bg-card p-4 hover:shadow-[var(--shadow-leaf)] transition">
              <div className="size-9 rounded-lg flex items-center justify-center text-primary-foreground" style={{ background: "var(--gradient-leaf)" }}>
                <Icon className="size-4" />
              </div>
              <p className="mt-3 font-medium text-sm">{l.t}</p>
              <p className="text-xs text-muted-foreground">{l.s}</p>
              <span className={`mt-2 inline-block text-[10px] rounded-full px-2 py-0.5 ${l.live ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {l.live ? "Open" : "Coming soon"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}