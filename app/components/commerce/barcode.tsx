import { cn } from "@/lib/utils";

/**
 * Decorative barcode ticket strip: deterministic stripes derived from the
 * value so the same SKU always draws the same code. Purely visual — the
 * mono label underneath carries the readable value.
 */
export function Barcode({
  value,
  className,
  showLabel = true,
}: {
  value: string;
  className?: string;
  showLabel?: boolean;
}) {
  const widths = Array.from(value).flatMap((char) => {
    const code = char.charCodeAt(0);
    return [(code % 3) + 1, ((code >> 2) % 2) + 1];
  });
  const total = widths.reduce((sum, w) => sum + w * 2, 0);

  let x = 0;
  const bars = widths.map((w, i) => {
    const bar = <rect key={i} x={x} y={0} width={w} height={12} />;
    x += w * 2;
    return bar;
  });

  return (
    <span className={cn("inline-flex flex-col items-start gap-0.5", className)}>
      <svg
        aria-hidden
        viewBox={`0 0 ${total} 12`}
        preserveAspectRatio="none"
        className="h-3 w-full fill-current"
      >
        {bars}
      </svg>
      {showLabel && (
        <span className="font-mono text-[10px] uppercase tracking-widest opacity-70">
          {value}
        </span>
      )}
    </span>
  );
}
