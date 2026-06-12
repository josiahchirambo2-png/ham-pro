import logoSrc from "@/assets/logo.png";

export function Logo({ className = "", size = 32 }: { className?: string; size?: number }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src={logoSrc}
        alt="HAM PRO logo"
        width={size}
        height={size}
        className="dark:invert"
        style={{ width: size, height: size }}
      />
      <span className="font-bold tracking-tight text-lg">HAM PRO</span>
    </div>
  );
}