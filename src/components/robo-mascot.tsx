// Tiny KIT robo mascot — pure CSS/SVG, no emojis.
export function RoboMascot({ size = 96, talking = false }: { size?: number; talking?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" role="img" aria-label="KIT robo mascot" className={talking ? "animate-bounce" : ""}>
      <defs>
        <linearGradient id="rm-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.06" />
        </linearGradient>
      </defs>
      <line x1="48" y1="10" x2="48" y2="20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="48" cy="8" r="4" fill="currentColor">
        <animate attributeName="r" values="3.2;4.4;3.2" dur="1.8s" repeatCount="indefinite" />
      </circle>
      <rect x="18" y="20" width="60" height="46" rx="16" fill="url(#rm-body)" stroke="currentColor" strokeWidth="3" />
      <circle cx="36" cy="42" r="5.5" fill="currentColor">
        <animate attributeName="ry" values="5.5;0.6;5.5" dur="4s" repeatCount="indefinite" />
      </circle>
      <circle cx="60" cy="42" r="5.5" fill="currentColor">
        <animate attributeName="ry" values="5.5;0.6;5.5" dur="4s" repeatCount="indefinite" />
      </circle>
      <path d="M38 55 q10 8 20 0" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <rect x="30" y="70" width="36" height="12" rx="6" fill="none" stroke="currentColor" strokeWidth="3" />
      <line x1="10" y1="44" x2="18" y2="44" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <line x1="78" y1="44" x2="86" y2="44" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
