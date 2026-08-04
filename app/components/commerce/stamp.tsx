import { cn } from "@/lib/utils";

/**
 * A rubber-stamp imprint: boxed uppercase expanded caps, casually rotated,
 * ink slightly uneven. The world's headline accent — use sparingly, once
 * per composition.
 */
export function Stamp({
  className,
  tilt = -2,
  children,
}: {
  className?: string;
  tilt?: number;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "stamp-display inline-block border-[3px] border-primary px-3 py-1 text-primary",
        "[text-shadow:0.5px_0.5px_0_currentColor]",
        className
      )}
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      {children}
    </span>
  );
}
