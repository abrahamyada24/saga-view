import type { SVGProps } from "react";

export function Smiley({
  size = 48,
  className = "",
  ...props
}: { size?: number; className?: string } & SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} {...props}>
      <circle cx="32" cy="32" r="29" fill="currentColor" stroke="#0d0d0d" strokeWidth="3" />
      <circle cx="23" cy="26" r="3.2" fill="#0d0d0d" />
      <circle cx="41" cy="26" r="3.2" fill="#0d0d0d" />
      <path
        d="M20 38 Q32 50 44 38"
        fill="none"
        stroke="#0d0d0d"
        strokeLinecap="round"
        strokeWidth="3.2"
      />
    </svg>
  );
}

export function Starburst({ size = 56, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
      <path
        d="M32 2 L37 22 L57 12 L47 32 L62 42 L42 44 L46 62 L32 50 L18 62 L22 44 L2 42 L17 32 L7 12 L27 22 Z"
        fill="currentColor"
        stroke="#0d0d0d"
        strokeLinejoin="round"
        strokeWidth="2.5"
      />
    </svg>
  );
}

export function Wave({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 12" className={className} preserveAspectRatio="none">
      <path
        d="M0 6 Q 20 0 40 6 T 80 6 T 120 6 T 160 6 T 200 6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="3"
      />
    </svg>
  );
}

export function Marquee({ items }: { items: string[] }) {
  const loop = [...items, ...items, ...items, ...items];
  return (
    <div className="overflow-hidden border-y-2 border-foreground bg-foreground py-2 text-background">
      <div className="marquee-track">
        {loop.map((text, index) => (
          <span
            key={`${text}-${index}`}
            className="inline-flex items-center gap-6 px-6 text-[11px] font-bold uppercase tracking-[0.24em]"
          >
            {text}
            <span aria-hidden className="text-retro-sun">
              *
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
