import { CodePane, DIM, HI, INK } from "./code-pane";
import { ProtocolTrace, useShowcaseTrace } from "./protocol-trace";
import { FACTS } from "@/lib/facts";
import { useCountUp, useMaskedReveal } from "@/lib/motion";
import { useRef } from "react";

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
function StackSection({ resolved }: { resolved: boolean }) {
  // The strip narrates this visitor's own load, so the trace is measured
  // here rather than threaded down from the page.
  const trace = useShowcaseTrace(resolved);
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

export { StackSection };
