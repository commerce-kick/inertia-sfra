import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SortState } from "@/types/search";
import { router } from "@inertiajs/react";

/**
 * Sorting rule picker; each option carries its server-authored Search-Show
 * URL, so choosing one is a plain Inertia visit.
 */
export function SortSelect({ sort }: { sort: SortState }) {
  if (!sort.options.length) return null;

  return (
    <Select
      value={sort.ruleId}
      onValueChange={(ruleId) => {
        const option = sort.options.find((o) => o.id === ruleId);
        if (option?.url) {
          router.get(option.url, {}, { preserveState: true, preserveScroll: true });
        }
      }}
    >
      <SelectTrigger size="sm" className="w-auto gap-2" aria-label="Ordenar por">
        <SelectValue placeholder="Ordenar" />
      </SelectTrigger>
      <SelectContent>
        {sort.options.map((option) => (
          <SelectItem key={option.id} value={option.id ?? ""}>
            {option.displayName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
