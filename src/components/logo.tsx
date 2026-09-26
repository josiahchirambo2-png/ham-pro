import logoAsset from "@/assets/kit-ai-symbol.png.asset.json";

export function Logo({ className = "", size = 30 }: { className?: string; size?: number }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span
        className="grid shrink-0 place-items-center"
        style={{ width: size + 10, height: size + 10 }}
      >
        <img
          src={logoAsset.url}
          alt="KIT AI logo"
          width={488}
          height={481}
          className="h-full w-full object-contain dark:invert"
        />
      </span>
      <span className="text-sm font-semibold uppercase">KIT AI</span>
    </div>
  );
}
