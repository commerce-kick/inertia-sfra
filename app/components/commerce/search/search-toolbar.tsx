import { AppliedFilters } from "@/components/commerce/applied-filters";
import { RefinementPanel } from "@/components/commerce/refinement-panel";
import { SortSelect } from "@/components/commerce/sort-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { IRefinementData, ISelectedFilterData } from "@/generated/data";
import type { SortState } from "@/types/search";
import { SlidersHorizontal } from "lucide-react";

/**
 * Filter entry + applied-filter pills + sort. The refinement panel appears
 * here in a sheet below `lg`, where the desktop rail is hidden.
 */
function SearchToolbar({
  refinements,
  selectedFilters,
  resetLink,
  sort,
  currentUrl,
}: {
  refinements: IRefinementData[];
  selectedFilters: ISelectedFilterData[];
  resetLink: string;
  sort: SortState;
  currentUrl: string;
}) {
  const hasFilters = selectedFilters.length > 0;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <Sheet>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="outline" size="sm" className="label-caps">
              <SlidersHorizontal className="size-4" aria-hidden />
              Filter
              {hasFilters && (
                <Badge className="ml-1 px-1.5 text-[10px]">
                  {selectedFilters.length}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-left text-base">
                Filter the catalog
              </SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-8">
              <RefinementPanel
                refinements={refinements}
                currentUrl={currentUrl}
              />
            </div>
          </SheetContent>
        </Sheet>
        <AppliedFilters
          filters={selectedFilters}
          resetLink={resetLink}
        />
      </div>
      <SortSelect sort={sort} />
    </div>
  );
}

export { SearchToolbar };
