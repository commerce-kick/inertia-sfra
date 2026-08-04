import { cn } from "@/lib/utils";

/**
 * Section wrapper: bold heading, optional supporting line, optional action
 * link on the right, generous air above.
 */
export function Section({
  title,
  subtitle,
  meta,
  action,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  meta?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("container pt-20 first:pt-14", className)}>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h2>
          {subtitle && (
            <p className="max-w-xl text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          {meta && <span className="meta-caps text-muted-foreground">{meta}</span>}
          {action}
        </div>
      </header>
      {children}
    </section>
  );
}
