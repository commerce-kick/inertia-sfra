import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import { useInViewToggle, useMaskedReveal } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { CategoryShowcaseEntry } from "@/types/home";
import { ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Real seconds in the hero meta row — a watch store telling the time. SSR
 * renders a fixed-width placeholder in the same tabular advance so the
 * swap on hydration never shifts layout; the interval only starts on the
 * client. It keeps ticking under reduced motion: the data moves, nothing
 * is decorated.
 */
function LiveClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const format = () =>
      new Date().toLocaleTimeString("en-GB", { hour12: false });
    setTime(format());
    const id = window.setInterval(() => setTime(format()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span
      className="tabular-nums"
      aria-label="local time"
      suppressHydrationWarning
    >
      {time ?? "--:--:--"}
    </span>
  );
}

function Hero({
  firstCategory,
  secondCategory,
  categoryCount,
  locale,
}: {
  firstCategory?: CategoryShowcaseEntry;
  secondCategory?: CategoryShowcaseEntry;
  categoryCount: number;
  locale: string;
}) {
  const rootRef = useRef<HTMLElement>(null);
  // The one authored moment: the page dresses itself on arrival.
  useMaskedReveal(rootRef);

  // The line currents are an idle loop — keep them running only while the
  // hero is actually on screen.
  const [heroInView, setHeroInView] = useState(false);
  useInViewToggle(
    rootRef,
    useCallback((inView: boolean) => setHeroInView(inView), [])
  );

  return (
    <section
      ref={rootRef}
      className="relative flex min-h-[calc(100svh-4rem)] flex-col overflow-hidden"
    >
      {/* The drafting field: hairlines cover the whole screen, and segments
          of light travel them in both axes — signals moving through the
          system. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden md:block"
      >
        {[0, 25, 50, 75, 100].map((x, i) => (
          <div
            key={`v${x}`}
            data-anim="fade"
            className="absolute inset-y-0 w-px overflow-hidden bg-border"
            style={x === 100 ? { right: 0 } : { left: `${x}%` }}
          >
            <span
              className={cn(
                "line-current",
                !heroInView && "[animation-play-state:paused]"
              )}
              style={{ animationDelay: `${i * 1.7}s` }}
            />
          </div>
        ))}
        {/* one horizontal only — a line across the hero's lower third would
            cross the support row and meta (user call) */}
        {[25].map((y, i) => (
          <div
            key={`h${y}`}
            data-anim="fade"
            className="absolute inset-x-0 h-px overflow-hidden bg-border"
            style={{ top: `${y}%` }}
          >
            <span
              className={cn(
                "line-current-x",
                !heroInView && "[animation-play-state:paused]"
              )}
              style={{ animationDelay: `${2.6 + i * 3.3}s` }}
            />
          </div>
        ))}
      </div>
      <div className="container relative flex flex-1 flex-col pb-6 pt-10 lg:pt-14">
        <div className="flex flex-1 items-center">
          <h1 className="display-caps text-[clamp(3rem,9vw,9rem)]">
            <span className="block overflow-hidden">
              <span data-anim="line" className="block">
                Commerce,
              </span>
            </span>
            <span className="block overflow-hidden">
              <span data-anim="line" className="block">
                composed.
              </span>
            </span>
          </h1>
        </div>
        <div className="mt-10 flex flex-wrap items-end justify-between gap-8">
          <p
            data-anim="fade"
            className="max-w-md text-sm leading-relaxed text-muted-foreground"
          >
            A complete storefront catalog — browse the collections, from new
            arrivals to top sellers.
          </p>
          <div data-anim="fade" className="flex flex-wrap items-center gap-6">
            {firstCategory && (
              <Button asChild size="lg" className="label-caps h-12 px-8">
                <Link href={firstCategory.url}>
                  Explore {firstCategory.name}
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
            )}
            {secondCategory && (
              <Link
                href={secondCategory.url}
                className="link-draw label-caps py-1"
              >
                View {secondCategory.name}
              </Link>
            )}
          </div>
        </div>
        <div
          data-anim="rule"
          className="mt-12 h-px origin-left bg-border"
          aria-hidden
        />
        <div
          data-anim="fade"
          className="mt-4 flex flex-wrap justify-between gap-x-8 gap-y-1"
        >
          <span className="meta-caps whitespace-nowrap text-muted-foreground">
            Full catalog · {categoryCount} lines
          </span>
          <span className="meta-caps whitespace-nowrap text-muted-foreground">
            <LiveClock /> · {locale} · demo
          </span>
        </div>
      </div>
    </section>
  );
}

export { Hero };
