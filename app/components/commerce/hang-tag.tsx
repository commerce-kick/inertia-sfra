import { cn } from "@/lib/utils";

/**
 * The world's signature object: a string-tied swing tag. Pointed left end,
 * punched hole, twine loop. Carries prices on tiles and actions in heroes.
 */
export function HangTag({
  className,
  tilt = -3,
  children,
}: {
  className?: string;
  /** degrees of casual rotation; tags never hang perfectly straight */
  tilt?: number;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn("relative inline-flex items-center", className)}
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      {/* twine loop through the hole */}
      <svg
        aria-hidden
        viewBox="0 0 24 16"
        className="absolute -left-4 top-1/2 h-4 w-6 -translate-y-1/2 text-secondary-foreground/60"
      >
        <path
          d="M22 8 C14 1, 4 2, 2 8 C4 14, 14 15, 22 8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
      <span className="tag-shape inline-flex items-center gap-2 bg-card py-1.5 pl-6 pr-3 shadow-sm">
        {/* punched hole */}
        <span
          aria-hidden
          className="absolute left-2.5 top-1/2 size-2 -translate-y-1/2 rounded-full bg-background shadow-[inset_0_1px_1px_rgba(0,0,0,0.25)]"
        />
        {children}
      </span>
    </span>
  );
}
