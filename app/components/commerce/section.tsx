import { cn } from "@/lib/utils";

/**
 * Section wrapper: stamped-ink heading over a twine rule, mono meta on the
 * right, generous air above the heading.
 */
export function Section({
  title,
  meta,
  action,
  className,
  children,
}: {
  title: string;
  meta?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("container pt-20 first:pt-12", className)}>
      <header className="flex items-end justify-between gap-4 pb-2">
        <h2 className="stamp-display text-2xl leading-none sm:text-3xl">
          {title}
        </h2>
        <div className="flex items-center gap-4 pb-0.5">
          {meta && (
            <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              {meta}
            </span>
          )}
          {action}
        </div>
      </header>
      <div className="mb-8 border-t border-dashed border-secondary-foreground/25" />
      {children}
    </section>
  );
}
