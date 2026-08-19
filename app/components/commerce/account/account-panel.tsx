import { Link } from "@/components/link";
import { cn } from "@/lib/utils";

/**
 * One block of the dashboard.
 *
 * Base drew these as Bootstrap cards. Structure here is drawn with lines, not
 * boxes: the panels sit in a hairline grid, so what separates them is a rule,
 * and each opens with a label and its one action on the same baseline.
 */
export function AccountPanel({
  title,
  action,
  className,
  children,
}: {
  title: string;
  action?: { label: string; href: string };
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("flex flex-col gap-5 bg-background p-8", className)}>
      <header className="flex items-baseline justify-between gap-4">
        <h2 className="label-caps">{title}</h2>
        {action && (
          <Link
            href={action.href}
            className="link-draw label-caps text-muted-foreground transition-colors hover:text-foreground"
          >
            {action.label}
          </Link>
        )}
      </header>
      {children}
    </section>
  );
}

/** What a panel shows when the thing it describes does not exist yet. */
export function PanelEmpty({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm leading-relaxed text-muted-foreground">{children}</p>
  );
}

/**
 * A labelled fact inside a panel — the dashboard is a spec sheet, not prose.
 * The label is a label and the value is prose, so neither is mono; figures
 * that are actually data (an order number, a total) set their own voice.
 */
export function PanelFact({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="label-caps text-muted-foreground">{label}</dt>
      <dd className="text-sm leading-relaxed">{children}</dd>
    </div>
  );
}
