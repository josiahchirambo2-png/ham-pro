import logoAsset from "@/assets/kit-ai-symbol.png.asset.json";

export function RoboMascot({ size = 96, talking = false }: { size?: number; talking?: boolean }) {
  return (
    <span
      role="img"
      aria-label="KIT AI mascot"
      className={`relative inline-grid shrink-0 place-items-center rounded-full border border-border bg-card p-[14%] shadow-[var(--shadow-chrome)] ${talking ? "animate-bounce" : ""}`}
      style={{ width: size, height: size }}
    >
      <span className="absolute inset-[7%] rounded-full border border-border/60" aria-hidden="true" />
      <img
        src={logoAsset.url}
        alt=""
        width={488}
        height={481}
        className="relative h-full w-full object-contain dark:invert"
      />
    </span>
  );
}
