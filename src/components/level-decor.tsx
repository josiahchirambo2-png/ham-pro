import { useEffect, useState } from "react";
import { detectTier, type LevelTier } from "@/lib/level";
import { APPEARANCE_EVENT, getLevelText } from "@/lib/appearance";

export function useLevelTier(): LevelTier {
  const [tier, setTier] = useState<LevelTier>("secondary");
  useEffect(() => {
    const read = () => {
      const text = getLevelText();
      setTier(text ? detectTier(text) : "secondary");
    };
    read();
    window.addEventListener(APPEARANCE_EVENT, read);
    return () => window.removeEventListener(APPEARANCE_EVENT, read);
  }, []);
  return tier;
}

function Dino({ className, hue }: { className?: string; hue: number }) {
  return (
    <svg viewBox="0 0 120 100" className={className} aria-hidden="true">
      <g fill={`oklch(0.72 0.17 ${hue})`}>
        <path d="M20 82c-6 0-10-4-10-10 0-14 10-24 24-27 3-16 16-27 33-27 17 0 30 12 31 28 8 3 13 10 13 18 0 10-8 18-18 18H20z" />
        <path d="M92 44c6-6 14-7 20-3-5 2-8 6-9 11-4-3-7-5-11-8z" />
      </g>
      <g fill={`oklch(0.85 0.14 ${hue + 40})`}>
        <circle cx="52" cy="46" r="12" />
      </g>
      <circle cx="72" cy="40" r="6" fill="#fff" />
      <circle cx="74" cy="41" r="3" fill="#1a1a1a" />
      <path d="M62 58c6 5 16 5 22 0" stroke="#1a1a1a" strokeWidth="3" fill="none" strokeLinecap="round" />
      <g fill={`oklch(0.62 0.19 ${hue - 30})`}>
        <path d="M34 34l8 12-16 2z" />
        <path d="M24 48l6 12-15 1z" />
      </g>
    </svg>
  );
}

function Robot({ className, hue }: { className?: string; hue: number }) {
  return (
    <svg viewBox="0 0 120 100" className={className} aria-hidden="true">
      <rect x="34" y="26" width="52" height="42" rx="12" fill={`oklch(0.7 0.09 ${hue})`} />
      <rect x="46" y="38" width="28" height="16" rx="8" fill="oklch(0.22 0.03 260)" />
      <circle cx="54" cy="46" r="4" fill={`oklch(0.85 0.17 ${hue + 60})`} />
      <circle cx="66" cy="46" r="4" fill={`oklch(0.85 0.17 ${hue + 60})`} />
      <rect x="56" y="14" width="4" height="12" fill={`oklch(0.6 0.08 ${hue})`} />
      <circle cx="58" cy="12" r="5" fill={`oklch(0.85 0.17 ${hue + 60})`} />
      <rect x="44" y="70" width="32" height="20" rx="6" fill={`oklch(0.62 0.08 ${hue})`} />
      <rect x="20" y="70" width="20" height="6" rx="3" fill={`oklch(0.7 0.09 ${hue})`} />
      <rect x="80" y="70" width="20" height="6" rx="3" fill={`oklch(0.7 0.09 ${hue})`} />
      <g stroke={`oklch(0.8 0.14 ${hue + 60})`} strokeWidth="2" fill="none">
        <circle cx="104" cy="30" r="9" />
        <path d="M104 21v-4M104 43v-4M95 30h-4M117 30h-4" />
      </g>
    </svg>
  );
}

function Planet({ className, hue }: { className?: string; hue: number }) {
  return (
    <svg viewBox="0 0 120 100" className={className} aria-hidden="true">
      <circle cx="58" cy="52" r="26" fill={`oklch(0.62 0.16 ${hue})`} />
      <ellipse cx="58" cy="52" rx="44" ry="12" fill="none" stroke={`oklch(0.82 0.13 ${hue + 50})`} strokeWidth="4" transform="rotate(-18 58 52)" />
      <circle cx="50" cy="44" r="6" fill={`oklch(0.74 0.13 ${hue})`} />
      <circle cx="68" cy="60" r="4" fill={`oklch(0.74 0.13 ${hue})`} />
      <g fill={`oklch(0.95 0.1 ${hue + 60})`}>
        <path d="M14 16l2.5 6 6 2.5-6 2.5L14 33l-2.5-6L5 24.5l6-2.5z" />
        <path d="M104 66l1.8 4.4 4.4 1.8-4.4 1.8-1.8 4.4-1.8-4.4-4.4-1.8 4.4-1.8z" />
        <circle cx="96" cy="18" r="2.5" />
        <circle cx="26" cy="82" r="2" />
      </g>
    </svg>
  );
}

const SETS: Record<LevelTier, { label: string; Char: typeof Dino; hues: number[] }> = {
  primary: { label: "Dino crew", Char: Dino, hues: [145, 50, 320] },
  secondary: { label: "Deep space", Char: Planet, hues: [265, 30, 200] },
  university: { label: "Robotics bay", Char: Robot, hues: [250, 80, 160] },
};

/** Floating characters that match the learner's level: dinos, planets or robots. */
export function LevelDecor({ tier }: { tier: LevelTier }) {
  const set = SETS[tier];
  const Char = set.Char;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {set.hues.map((hue, i) => (
        <Char
          key={hue}
          hue={hue}
          className={`decor-float decor-float-${i + 1} absolute w-20 md:w-28 opacity-80 drop-shadow`}
        />
      ))}
    </div>
  );
}

/** Inline row of the level characters, used as a friendly banner. */
export function LevelMascots({ tier, className = "" }: { tier: LevelTier; className?: string }) {
  const set = SETS[tier];
  const Char = set.Char;
  return (
    <div className={`flex items-end gap-3 ${className}`}>
      {set.hues.map((hue, i) => (
        <Char key={hue} hue={hue} className={`w-16 md:w-20 decor-bob decor-bob-${i + 1}`} />
      ))}
    </div>
  );
}

export const TIER_DECOR_LABEL: Record<LevelTier, string> = {
  primary: "Dino friends",
  secondary: "Planets & stars",
  university: "Mechanics & robots",
};