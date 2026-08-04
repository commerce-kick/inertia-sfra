import { cn } from "@/lib/utils";

/**
 * Punched paper ticket: the world's chip. Notched edges, dashed tear line
 * before the trailing slot when present. Used for category chips, applied
 * filters, and toolbar controls.
 */
export function Ticket({
  className,
  children,
  trailing,
}: {
  className?: string;
  children: React.ReactNode;
  /** content after the perforation (e.g. a remove button) */
  trailing?: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "ticket-notch ticket-caps inline-flex items-stretch bg-card text-xs text-card-foreground shadow-xs",
        className
      )}
    >
      <span className="inline-flex items-center gap-1.5 py-1.5 pl-4 pr-3">
        {children}
      </span>
      {trailing && (
        <span className="inline-flex items-center border-l border-dashed border-border py-1.5 pl-2 pr-3.5">
          {trailing}
        </span>
      )}
    </span>
  );
}
