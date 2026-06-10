import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

/** Countdown timer. Calls onExpire once when reaching 0. Returns null if disabled (seconds <= 0). */
export function FlowTimer({
  seconds,
  onExpire,
  label,
}: {
  seconds: number;
  onExpire?: () => void;
  label?: string;
}) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    setLeft(seconds);
  }, [seconds]);

  useEffect(() => {
    if (seconds <= 0) return;
    if (left <= 0) {
      onExpire?.();
      return;
    }
    const t = setTimeout(() => setLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [left, seconds, onExpire]);

  if (seconds <= 0) return null;

  const m = Math.floor(left / 60);
  const s = left % 60;
  const warn = left <= 15;
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border ${
        warn
          ? "border-[var(--warning)]/40 bg-[var(--warning)]/10 text-[var(--warning)]"
          : "border-border bg-muted/40 text-foreground"
      }`}
      role="timer"
      aria-label={label ?? "Sisa waktu"}
    >
      <Clock className="w-3 h-3" />
      {m}:{String(s).padStart(2, "0")}
    </div>
  );
}
