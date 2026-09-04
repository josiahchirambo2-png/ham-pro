import logoSrc from "@/assets/logo-inverted.png";

export function Logo({ className = "", size = 30 }: { className?: string; size?: number }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span
        className="grid place-items-center rounded-full border border-border bg-secondary/40 p-1"
        style={{ width: size + 10, height: size + 10 }}
      >
        <img
          src={logoSrc}
          alt="KIT AI chrome chip logo"
          width={1024}
          height={1024}
          style={{ width: size, height: size }}
        />
      </span>
      <span className="font-semibold uppercase tracking-[0.22em] text-sm">KIT AI</span>
    </div>
  );
}
