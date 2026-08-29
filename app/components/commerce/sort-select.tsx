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
 * Labels for the stock SFCC sorting rule ids; unknown rules fall back to
 * the server-authored displayName.
 */
const SORT_LABELS: Record<string, string> = {
  "best-matches": "Relevance",
  "price-low-to-high": "Price: low to high",
  "price-high-to-low": "Price: high to low",
  "product-name-ascending": "Name A–Z",
  "product-name-descending": "Name Z–A",
  "most-popular": "Most popular",
  "top-sellers": "Top sellers",
  brand: "Brand",
};

/**
 * Sorting rule picker; each option carries its server-authored Search-Show
 * URL, so choosing one is a plain Inertia visit.
 */
export function SortSelect({ sort }: { sort: SortState }) {
  // A sorting rule with no ID is not a rule anything can be sorted by, and
  // Radix refuses an item with an empty value outright — the empty string is
  // what clears a select. Drop them rather than coercing to "".
  const options = sort.options.filter((option) => Boolean(option.id));

  if (!options.length) return null;

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
      <SelectTrigger
        size="sm"
        className="label-caps w-auto gap-2"
        aria-label="Sort by"
      >
        <SelectValue placeholder="Sort" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.id} value={option.id}>
            {SORT_LABELS[option.id] ?? option.displayName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
