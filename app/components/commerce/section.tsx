import { useMaskedReveal } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useRef } from "react";

/**
 * Section wrapper: hairline top rule, display-caps title, data meta and
 * action on the baseline — the lookbook chapter head.
 *
 * With `reveal`, the head replays the hero grammar once when it first
 * enters the viewport (the chapter-reveal device): the title rises from
 * behind a mask, the top rule draws itself, meta and action settle in.
 * Markup still renders in its final state for SSR/no-JS/reduced motion.
 *
 * Pass `rule={false}` when the preceding region already ends in a
 * full-width hairline (marquee border, carousel progress track) — one
 * line introduces a chapter, never two.
 */
export function Section({
  title,
  subtitle,
  meta,
  action,
  className,
  reveal = false,
  rule = true,
  children,
}: {
  title: string;
  subtitle?: string;
  meta?: string;
  action?: React.ReactNode;
  className?: string;
  reveal?: boolean;
  rule?: boolean;
  children: React.ReactNode;
}) {
  const headerRef = useRef<HTMLElement>(null);
  useMaskedReveal(headerRef, { whenInView: true });

  return (
    <section className={cn("container pt-24 first:pt-16", className)}>
      <header
        ref={headerRef}
        className={cn("mb-10", !reveal && rule && "border-t", !reveal && rule && "pt-5")}
      >
        {reveal && rule && (
          <div
            data-anim="rule"
            className="h-px origin-left bg-border"
            aria-hidden
          />
        )}
        <div
          className={cn(
            "flex flex-wrap items-end justify-between gap-4",
            reveal && rule && "pt-5"
          )}
        >
          {reveal ? (
            <h2 className="display-caps text-4xl sm:text-5xl">
              <span className="block overflow-hidden">
                <span data-anim="line" className="block">
                  {title}
                </span>
              </span>
            </h2>
          ) : (
            <h2 className="display-caps text-4xl sm:text-5xl">{title}</h2>
          )}
          <div
            {...(reveal ? { "data-anim": "fade" } : {})}
            className="flex items-baseline gap-6 pb-1"
          >
            {meta && (
              <span className="meta-caps text-muted-foreground">{meta}</span>
            )}
            {action}
          </div>
        </div>
        {subtitle && (
          <p
            {...(reveal ? { "data-anim": "fade" } : {})}
            className="mt-3 max-w-xl text-sm text-muted-foreground"
          >
            {subtitle}
          </p>
        )}
      </header>
      {children}
    </section>
  );
}
