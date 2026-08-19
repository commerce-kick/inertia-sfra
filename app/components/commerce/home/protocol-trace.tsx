import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ShowcaseTrace = {
  mounted: boolean;
  resolved: boolean;
  deferMs: number | null;
};

/**
 * Narrates the visitor's own page load, truthfully: the mount time is taken
 * at hydration, and if the deferred "showcase" group was still pending at
 * that moment, the elapsed time to its resolution is measured for real.
 * On revisits where Inertia delivers the props already resolved, nothing
 * pends and nothing is replayed.
 */
function useShowcaseTrace(resolved: boolean): ShowcaseTrace {
  const [mounted, setMounted] = useState(false);
  const [deferMs, setDeferMs] = useState<number | null>(null);
  const mountedAt = useRef<number | null>(null);
  const sawPending = useRef(false);

  useEffect(() => {
    mountedAt.current = performance.now();
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!resolved) {
      sawPending.current = true;
    } else if (
      sawPending.current &&
      deferMs === null &&
      mountedAt.current !== null
    ) {
      setDeferMs(Math.round(performance.now() - mountedAt.current));
    }
  }, [resolved, deferMs]);

  return { mounted, resolved, deferMs };
}

const TRACE_INKS = {
  done: "border-white/40 text-white",
  active: "border-white/20 text-[oklch(0.8_0_0)]",
  pending: "border-white/20 text-[oklch(0.5_0_0)]",
} as const;

/**
 * The live protocol trace: each chip settles dim → ink only when the real
 * Inertia event it names occurs on this page load. The XHR chip pulses
 * while the deferred group is actually in flight, and the final chip is
 * stamped with the measured time from mount to resolution.
 */
function ProtocolTrace({ trace }: { trace: ShowcaseTrace }) {
  const steps: {
    label: string;
    state: keyof typeof TRACE_INKS;
    stamp?: string;
  }[] = [
    { label: "GET Home-Show", state: "done" },
    { label: "first render", state: trace.mounted ? "done" : "pending" },
    {
      label: 'XHR · "showcase"',
      state: trace.resolved ? "done" : trace.mounted ? "active" : "pending",
    },
    {
      label: "<Deferred> resolved",
      state: trace.resolved ? "done" : "pending",
      stamp:
        trace.resolved && trace.deferMs !== null
          ? `+${trace.deferMs}ms`
          : undefined,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {steps.map((step, i) => (
        <span key={step.label} className="flex items-center gap-2">
          {i > 0 && (
            <ArrowRight className="size-3 text-[oklch(0.5_0_0)]" aria-hidden />
          )}
          <span
            className={cn(
              "meta-caps flex items-center gap-2 border px-2.5 py-1.5",
              "motion-safe:transition-colors motion-safe:duration-(--motion-base)",
              TRACE_INKS[step.state]
            )}
          >
            {step.state === "active" && (
              <span
                className="size-1.5 shrink-0 bg-white motion-safe:animate-pulse"
                aria-hidden
              />
            )}
            {step.label}
            {step.stamp && (
              <span className="text-[oklch(0.55_0_0)]">{step.stamp}</span>
            )}
          </span>
        </span>
      ))}
    </div>
  );
}

export { ProtocolTrace, useShowcaseTrace };
export type { ShowcaseTrace };
