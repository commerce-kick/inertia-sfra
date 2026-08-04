import { Ticket } from "@/components/commerce/ticket";
import type { ISelectedFilterData } from "@/generated/data";
import { router } from "@inertiajs/react";
import { X } from "lucide-react";

function visit(url: string) {
  router.get(url, {}, { preserveState: true, preserveScroll: true });
}

/**
 * Applied filters as torn-off tickets; the perforated stub removes one,
 * the reset link tears them all off.
 */
export function AppliedFilters({
  filters,
  resetLink,
}: {
  filters: ISelectedFilterData[];
  resetLink: string;
}) {
  if (!filters.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((filter) => (
        <Ticket
          key={`${filter.id}-${filter.displayValue}`}
          trailing={
            <button
              type="button"
              onClick={() => filter.url && visit(filter.url)}
              aria-label={`Quitar filtro ${filter.displayValue}`}
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              <X className="size-3" />
            </button>
          }
        >
          {filter.displayValue}
        </Ticket>
      ))}
      <button
        type="button"
        onClick={() => visit(resetLink)}
        className="ticket-caps text-xs text-primary underline-offset-4 hover:underline"
      >
        Limpiar todo
      </button>
    </div>
  );
}
