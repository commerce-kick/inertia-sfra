import { BonusChooser } from "./bonus-chooser";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IBonusOfferData, IProductDetailData } from "@/generated/data";
import { cartShow } from "@/generated/routes/cart-show";
import { useAddToCart } from "@/lib/queries/cart";
import { router } from "@inertiajs/react";
import { useState } from "react";
import { toast } from "sonner";

/** Partial visit: only `product` changes when quantity or an option moves. */
const VISIT = { only: ["product"], preserveScroll: true, preserveState: true };

/**
 * How a re-resolution is applied — the same split the swatches make. The PDP
 * navigates to the server-authored Product-Show URL so the choice lands in
 * the address bar; quickview cannot leave the grid, so it passes a handler
 * and swaps the product in place through Product-Variation.
 */
type ApplySelection = ((variationUrl: string) => void) | undefined;

function apply(url: string, variationUrl: string, onSelect: ApplySelection) {
  if (onSelect) onSelect(variationUrl);
  else router.get(url, {}, VISIT);
}

/**
 * The quantity pull-down. Base built one option per orderable quantity, each
 * carrying the URL that re-resolves the product at it — so quantity is
 * server state here too, and availability is re-checked as it changes.
 */
function QuantitySelect({
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
          if (next) apply(next.url, next.variationUrl, onSelect);
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
function OptionSelects({
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
              if (next) apply(next.url, next.variationUrl, onSelect);
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

/**
 * The add-to-bag control: quantity, product options, and the button.
 *
 * It holds no state of its own. Quantity and every option are resolved by
 * the URL the shopper is on, so the product model already reports what would
 * be added — the button posts back exactly what the server last said.
 *
 * A master product with an unchosen variation attribute is not ready to
 * order; base disabled the same button on the same flag.
 */
export function AddToBag({
  product,
  onSelect,
}: {
  product: IProductDetailData;
  onSelect?: (variationUrl: string) => void;
}) {
  const addToCart = useAddToCart();
  // A choice-of-bonus promotion the addition just earned. It exists only in
  // the answer — nothing can ask for it afterwards but Cart-EditBonusProduct.
  const [offer, setOffer] = useState<IBonusOfferData | null>(null);
  const unavailable = !product.availability.available;
  const blocked = !product.readyToOrder || unavailable;

  return (
    <div className="flex w-full flex-col items-start gap-5 pt-2">
      <QuantitySelect product={product} onSelect={onSelect} />
      <OptionSelects product={product} onSelect={onSelect} />

      <Button
        size="lg"
        disabled={blocked || addToCart.isPending}
        className="label-caps h-13 w-full max-w-sm"
        onClick={() =>
          addToCart.mutate(
            {
              pid: product.id,
              quantity: product.selectedQuantity,
              options: product.options.length
                ? JSON.stringify(
                    product.options.map((option) => ({
                      optionId: option.id,
                      selectedValueId: option.selectedValueId,
                    }))
                  )
                : undefined,
            },
            {
              onSuccess: (result) => {
                toast.success(result.message || "Added to bag", {
                  action: {
                    label: "View bag",
                    onClick: () => router.visit(cartShow()),
                  },
                });
                if (result.bonusOffer) setOffer(result.bonusOffer);
              },
              onError: (error) => toast.error(error.message),
            }
          )
        }
      >
        {addToCart.isPending ? "Adding" : "Add to bag"}
      </Button>

      {blocked && (
        <span className="meta-caps text-muted-foreground">
          {unavailable ? "Out of stock" : "Choose every option to continue"}
        </span>
      )}

      <BonusChooser
        offer={offer}
        onOpenChange={(open) => {
          if (!open) setOffer(null);
        }}
      />
    </div>
  );
}
