import { Badge } from "@/components/ui/badge";
import type { ISelectedFilterData } from "@/generated/data";
import { router } from "@inertiajs/react";
import { X } from "lucide-react";

function visit(url: string) {
  router.get(url, {}, { preserveState: true, preserveScroll: true });
}

/** Applied filters as removable pills, with a clear-all link. */
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
        <Badge
          key={`${filter.id}-${filter.displayValue}`}
          variant="secondary"
          className="gap-1 rounded-none pr-1.5 font-normal"
        >
          {filter.displayValue}
          <button
            type="button"
            onClick={() => filter.url && visit(filter.url)}
            aria-label={`Quitar filtro ${filter.displayValue}`}
            className="rounded-none p-0.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      <button
        type="button"
        onClick={() => visit(resetLink)}
        className="text-sm font-medium text-link underline-offset-4 hover:underline"
      >
        Limpiar todo
      </button>
    </div>
  );
}
