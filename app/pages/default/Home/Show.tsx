import { CategoryCard } from "@/components/commerce/category-card";
import {
  ProductTile,
  ProductTileSkeleton,
} from "@/components/commerce/product-tile";
import { Section } from "@/components/commerce/section";
import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { FACTS } from "@/lib/facts";
import { useCountUp, useInViewToggle, useMaskedReveal } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type {
  CategoryShowcaseEntry,
  HomeShowProps,
  ShowcaseRow,
} from "@/types/home";
import { Deferred, Head, usePage } from "@inertiajs/react";
import { ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const pad2 = (n: number) => String(n).padStart(2, "0");

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

/** Slow typographic marquee — truthful words only, stands still on reduced motion. */
function MarqueeStrip() {
  const items = [
    "Collections",
    "Full catalog",
    "Open source",
    "Inertia + SFRA",
    "Meridian",
  ];
  const row = (hidden: boolean) => (
    <div
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center"
    >
      {items.map((item) => (
        <span key={item} className="flex items-center">
          <span className="display-caps px-8 text-2xl md:text-3xl">{item}</span>
          <span className="size-2 bg-foreground" aria-hidden />
        </span>
      ))}
    </div>
  );

  return (
    <div className="group overflow-hidden border-y py-5">
      <div className="animate-marquee flex w-max group-hover:[animation-play-state:paused]">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}

function ShowcaseCarousel({ row }: { row: ShowcaseRow }) {
  const [api, setApi] = useState<CarouselApi>();
  const [first, setFirst] = useState(1);
  const thumbRef = useRef<HTMLDivElement>(null);
  const total = row.products.length;

  // Progress hairline + counter read the carousel's real state: the ink
  // segment follows Embla's scrollProgress (transform-only, no re-render),
  // the mono readout names the first visible item — the mono-ticker device.
  useEffect(() => {
    if (!api) return;

    const onScroll = () => {
      const raw = api.scrollProgress();
      const progress = Number.isFinite(raw)
        ? Math.min(1, Math.max(0, raw))
        : 0;
      if (thumbRef.current) {
        thumbRef.current.style.transform = `translateX(${progress * 300}%)`;
      }
    };
    const onSlidesInView = () => {
      const visible = api.slidesInView();
      if (visible.length) setFirst(Math.min(...visible) + 1);
    };

    onScroll();
    onSlidesInView();
    api.on("scroll", onScroll);
    api.on("reInit", onScroll);
    api.on("slidesInView", onSlidesInView);
    return () => {
      api.off("scroll", onScroll);
      api.off("reInit", onScroll);
      api.off("slidesInView", onSlidesInView);
    };
  }, [api]);

  return (
    <div>
      <Carousel opts={{ align: "start" }} setApi={setApi} className="w-full">
        <CarouselContent className="-ml-5">
          {row.products.map((product, index) => (
            <CarouselItem
              key={product.id}
              className="basis-3/4 pl-5 sm:basis-2/5 lg:basis-[30%] xl:basis-1/4"
            >
              {/* Staggered fill: the deferred XHR lands as choreography,
                  each tile a beat behind the last (entrance device). */}
              <div
                className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-(--motion-slow) motion-safe:[animation-fill-mode:backwards]"
                style={{ animationDelay: `${Math.min(index, 5) * 60}ms` }}
              >
                <ProductTile product={product} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-4 hidden sm:inline-flex" />
        <CarouselNext className="-right-4 hidden sm:inline-flex" />
      </Carousel>
      <div className="mt-5 flex items-center gap-6">
        <div className="relative h-px flex-1 bg-border" aria-hidden>
          <div
            ref={thumbRef}
            className="absolute inset-y-0 left-0 w-1/4 bg-foreground"
          />
        </div>
        <span className="meta-caps tabular-nums text-muted-foreground">
          {pad2(first)} / {pad2(total)}
        </span>
      </div>
    </div>
  );
}

/**
 * Deferred fallback mirroring what actually arrives: one skeleton row per
 * showcased category (the controller sends up to three), titled with the
 * real category names so the fill never relabels or reflows the page.
 */
function ShowcaseFallback({
  categories,
}: {
  categories: CategoryShowcaseEntry[];
}) {
  const rows = categories.slice(0, 3);
  if (rows.length === 0) return null;

  return (
    <>
      {rows.map((category) => (
        <Section
          key={category.id}
          title={category.name}
          meta="loading · deferred"
          className="pt-12"
          rule={false}
        >
          <div className="flex gap-5 overflow-hidden">
            {Array.from({ length: 4 }, (_, i) => (
              <ProductTileSkeleton
                key={i}
                className="w-[70%] shrink-0 sm:w-[36%] lg:w-[27%] xl:w-[22%]"
              />
            ))}
          </div>
        </Section>
      ))}
    </>
  );
}

const STACK_ITEMS = [
  {
    title: "SFRA controllers",
    body: "Salesforce B2C Commerce controllers, middleware and session stay intact on the server.",
  },
  {
    title: "Inertia v2 protocol",
    body: "Partial reloads, deferred props, infinite scroll and flash — the full protocol, adapted to SFCC.",
  },
  {
    title: "React 19 + Vite",
    body: "Modern frontend with HMR, end-to-end TypeScript and shadcn/ui components.",
  },
];

/* Monochrome code inks (the band is always black, both themes). */
const INK = "text-[oklch(0.75_0_0)]";
const HI = "text-white";
const DIM = "text-[oklch(0.5_0_0)]";

function CodePane({
  file,
  runtime,
  children,
}: {
  file: string;
  runtime: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden border border-white/20">
      <div className="flex items-center justify-between gap-4 border-b border-white/20 px-4 py-2.5">
        <span className="meta-caps text-white">{file}</span>
        <span className="meta-caps text-[oklch(0.55_0_0)]">{runtime}</span>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed">
        {children}
      </pre>
    </div>
  );
}

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

/* Real numbers about this repo — enforced by test/unit/facts.test.ts. */
const STATS: { value: number | string; label: string }[] = [
  { value: FACTS.unitTests, label: "Unit tests passing" },
  { value: FACTS.protocolParity, label: "Protocol parity" },
  { value: FACTS.routeHelpers, label: "Route helpers, generated" },
  { value: FACTS.dtoTypes, label: "DTO types, generated" },
];

function StatFigure({ value }: { value: number | string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useCountUp(ref, typeof value === "number" ? value : null);

  return (
    <span
      ref={ref}
      className="font-mono text-3xl tracking-[0.04em] tabular-nums sm:text-4xl"
    >
      {value}
    </span>
  );
}

/**
 * The developer peak: the actual SFRA controller code that renders this
 * page, and the line that consumes it — every character is true of this
 * repo. The protocol strip narrates what the visitor's own page load did,
 * and the stats grid carries only figures the test suite can derive.
 */
function StackSection({ trace }: { trace: ShowcaseTrace }) {
  const headRef = useRef<HTMLDivElement>(null);
  useMaskedReveal(headRef, { whenInView: true });

  return (
    <section
      data-band="stack"
      className="mt-10 border-y border-white/15 bg-[oklch(0.05_0_0)] text-white"
    >
      <div className="container grid gap-12 py-20 lg:grid-cols-[5fr_6fr] lg:items-center">
        <div ref={headRef} className="flex flex-col items-start gap-8">
          <div className="flex flex-col gap-4">
            <h2 className="display-caps text-4xl sm:text-5xl">
              <span className="block overflow-hidden">
                <span data-anim="line" className="block">
                  Built on
                </span>
              </span>
              <span className="block overflow-hidden">
                <span data-anim="line" className="block">
                  Inertia + SFRA
                </span>
              </span>
            </h2>
            <p
              data-anim="fade"
              className="max-w-md text-sm leading-relaxed text-[oklch(0.72_0_0)]"
            >
              This storefront is the open-source reference implementation of
              the Inertia.js adapter for Salesforce B2C Commerce.
            </p>
          </div>
          <ul data-anim="fade" className="w-full">
            {STACK_ITEMS.map((item) => (
              <li
                key={item.title}
                className="flex flex-col gap-1.5 border-t border-white/20 py-4"
              >
                <h3 className="label-caps">{item.title}</h3>
                <p className="text-sm leading-relaxed text-[oklch(0.72_0_0)]">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <CodePane file="controllers/Home.js" runtime="SFRA · server">
            <code className={INK}>
              {"server."}
              <span className={HI}>replace</span>
              {"("}
              <span className={HI}>&quot;Show&quot;</span>
              {", initInertia.init, shareData, "}
              <span className={HI}>function</span>
              {" (req, res, next) {\n"}
              {"  inertia."}
              <span className={HI}>render</span>
              {"("}
              <span className={HI}>&quot;Home/Show&quot;</span>
              {", {\n"}
              {"    categoryShowcase: categoryShowcase,\n"}
              {"    showcases: inertia."}
              <span className={HI}>defer</span>
              {"(showcaseRows, "}
              <span className={HI}>&quot;showcase&quot;</span>
              {"),\n"}
              {"  });\n"}
              {"  next();\n"}
              {"});"}
            </code>
          </CodePane>
          <CodePane file="pages/default/Home/Show.tsx" runtime="React · client">
            <code className={INK}>
              <span className={HI}>const</span>
              {" { categoryShowcase, showcases } =\n  "}
              <span className={HI}>usePage</span>
              <span className={DIM}>{"<HomeShowProps>"}</span>
              {"().props;"}
            </code>
          </CodePane>

          <ProtocolTrace trace={trace} />
          <p className="meta-caps text-[oklch(0.55_0_0)]">
            The SFRA controller that renders this page · the strip above is
            your own page load
          </p>
        </div>
      </div>

      <div className="container pb-20">
        <div className="grid grid-cols-2 gap-x-12 gap-y-10 md:grid-cols-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col gap-2 border-t border-white/20 pt-4"
            >
              <StatFigure value={stat.value} />
              <span className="label-caps text-[oklch(0.72_0_0)]">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Show() {
  const { categoryShowcase, showcases, locale } =
    usePage<HomeShowProps>().props;
  const [firstCategory, secondCategory] = categoryShowcase;
  const trace = useShowcaseTrace(showcases !== undefined);

  return (
    <>
      <Head title="Meridian — storefront" />

      <Hero
        firstCategory={firstCategory}
        secondCategory={secondCategory}
        categoryCount={categoryShowcase.length}
        locale={locale}
      />

      <MarqueeStrip />

      {/* COLLECTIONS */}
      <Section
        title="Collections"
        meta={`${categoryShowcase.length} lines · eager`}
        className="pt-12"
        rule={false}
        reveal
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {categoryShowcase.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </Section>

      {/* DEFERRED PRODUCT ROWS — one XHR fills every row after first paint */}
      <Deferred
        data="showcases"
        fallback={<ShowcaseFallback categories={categoryShowcase} />}
      >
        <>
          {(showcases ?? []).map((row) => (
            <Section
              key={row.categoryId}
              title={row.title}
              meta={`${row.products.length} items · one XHR`}
              rule={false}
              className="pt-12 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-(--motion-slow)"
              action={
                <Link
                  href={row.url}
                  className="link-draw label-caps inline-flex items-center gap-2"
                >
                  View all
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              }
            >
              <ShowcaseCarousel row={row} />
            </Section>
          ))}
        </>
      </Deferred>

      {/* THE STACK — the honest pitch to the storefront's real audience */}
      <StackSection trace={trace} />
    </>
  );
}
