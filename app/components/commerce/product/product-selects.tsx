import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IProductDetailData } from "@/generated/data";
import { router } from "@inertiajs/react";

/** Partial visit: only `product` changes when quantity or an option moves. */
const VISIT = { only: ["product"], preserveScroll: true, preserveState: true };

/**
 * How a re-resolution is applied — the same split the swatches make. A page
 * navigates to the server-authored Product-Show URL so the choice lands in
 * the address bar; a dialog cannot leave the page under it, so it passes a
 * handler and swaps the product in place through Product-Variation.
 */
export type ApplySelection = ((variationUrl: string) => void) | undefined;

export function applySelection(
  url: string,
  variationUrl: string,
  onSelect: ApplySelection
) {
  if (onSelect) onSelect(variationUrl);
  else router.get(url, {}, VISIT);
}

/**
 * The quantity pull-down. Base built one option per orderable quantity, each
 * carrying the URL that re-resolves the product at it — so quantity is server
 * state, and availability is re-checked as it changes.
 */
export function QuantitySelect({
  product,
  onSelect,
}: {
  product: IProductDetailData;
  onSelect: ApplySelection;
}) {
  if (product.quantities.length < 2) return null;

  const current = product.quantities.find((quantity) => quantity.selected);
  if (!current) return null;

  return (
    <div className="flex flex-col gap-2.5">
      <span className="label-caps text-muted-foreground">Quantity</span>
      <Select
        value={String(current.value)}
        onValueChange={(value) => {
          const next = product.quantities.find(
            (quantity) => String(quantity.value) === value
          );
          if (next) applySelection(next.url, next.variationUrl, onSelect);
        }}
      >
        <SelectTrigger className="meta-caps w-24" aria-label="Quantity">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {product.quantities.map((quantity) => (
            <SelectItem
              key={quantity.value}
              value={String(quantity.value)}
              className="meta-caps"
            >
              {quantity.value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/** Product options — engraving, warranty, whatever the catalog defines. */
export function OptionSelects({
  product,
  onSelect,
}: {
  product: IProductDetailData;
  onSelect: ApplySelection;
}) {
  return (
    <>
      {product.options.map((option) => (
        <div key={option.id} className="flex w-full flex-col gap-2.5">
          <span className="label-caps text-muted-foreground">{option.name}</span>
          <Select
            value={option.selectedValueId}
            onValueChange={(value) => {
              const next = option.values.find((entry) => entry.id === value);
              if (next) applySelection(next.url, next.variationUrl, onSelect);
            }}
          >
            <SelectTrigger className="w-full max-w-sm" aria-label={option.name}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {option.values.map((value) => (
                <SelectItem key={value.id} value={value.id}>
                  <span className="flex w-full items-baseline justify-between gap-6">
                    <span>{value.displayValue}</span>
                    <span className="meta-caps text-muted-foreground">
                      {value.price}
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </>
  );
}
