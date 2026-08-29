import { VariationSwatches } from "@/components/commerce/product/variation-swatches";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { IBonusOfferData, IBonusProductData } from "@/generated/data";
import { useAddBonusProducts, type BonusPick } from "@/lib/queries/cart";
import { useBonusProducts, useVariation } from "@/lib/queries/product";
import { cn } from "@/lib/utils";
import { ImageOff } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

/**
 * One product the promotion offers.
 *
 * A master arrives without a chosen variant and cannot be picked until one
 * is chosen. The dialog must not navigate, so the swatches run in the same
 * handler mode quickview uses and the variant is swapped in place through
 * Product-Variation.
 */
function BonusProductCard({
  entry,
  picked,
  disabled,
  onToggle,
}: {
  entry: IBonusProductData;
  picked: boolean;
  disabled: boolean;
  onToggle: (pid: string, picked: boolean) => void;
}) {
  const [variationUrl, setVariationUrl] = useState<string | null>(null);
  const variation = useVariation(variationUrl);
  const product = variation.data?.product ?? entry.product;
  const image = product.images[0];
  const ready = entry.readyToOrder || Boolean(variation.data);

  return (
    <li className="flex flex-col gap-3">
      <button
        type="button"
        disabled={!ready || (disabled && !picked)}
        aria-pressed={picked}
        onClick={() => onToggle(product.id, !picked)}
        className={cn(
          "group flex flex-col gap-3 text-left transition-opacity",
          "focus-visible:outline-2 focus-visible:outline-offset-4",
          !ready || (disabled && !picked) ? "cursor-not-allowed opacity-40" : ""
        )}
      >
        <div
          className={cn(
            "aspect-[4/5] overflow-hidden bg-muted",
            picked && "outline-2 outline-offset-2 outline-foreground"
          )}
        >
          {image ? (
            <img
              src={image.url}
              alt={image.alt}
              loading="lazy"
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-1.5 text-muted-foreground">
              <ImageOff className="size-4" aria-hidden />
              <span className="meta-caps">No photo</span>
            </div>
          )}
        </div>
        <span className="label-caps">{product.productName}</span>
        <span className="meta-caps text-muted-foreground">
          {entry.bonusUnitPrice || "included"}
        </span>
      </button>

      {product.variationAttributes.length > 0 && (
        <VariationSwatches
          attributes={product.variationAttributes}
          onSelect={setVariationUrl}
        />
      )}
    </li>
  );
}

/**
 * The choice-of-bonus chooser.
 *
 * Base rendered it as a jQuery modal over an HTML string; the products arrive
 * typed (row 1.9) so this is built from the same components the PDP uses. The
 * offer that opens it is server-authored either way — it comes back from
 * Cart-AddProduct when the addition earns one, or from Cart-EditBonusProduct
 * when the shopper reopens one already in the bag.
 *
 * Quantity per pick is not offered: base's chooser had a per-product quantity
 * pull-down, but every RefArch choice-of-bonus promotion grants whole items,
 * and one tap per product is the whole interaction. Each pick counts one
 * toward the promotion's allowance, which is what the counter reports.
 */
export function BonusChooser({
  offer,
  onOpenChange,
}: {
  offer: IBonusOfferData | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [picks, setPicks] = useState<string[]>([]);
  const query = useBonusProducts(offer?.chooserUrl ?? null);
  const submit = useAddBonusProducts();

  const pages = query.data?.pages ?? [];
  const products = pages.flatMap((page) => page.products);
  const alreadyChosen = pages[0]?.selected;

  // What the shopper picked last time, so reopening an offer shows it.
  useEffect(() => {
    if (alreadyChosen?.length) {
      setPicks(alreadyChosen.map((chosen) => chosen.pid));
    }
  }, [alreadyChosen]);

  const maxPids = offer?.maxPids ?? 0;
  const full = picks.length >= maxPids;

  return (
    <Dialog
      open={Boolean(offer)}
      onOpenChange={(next) => {
        if (!next) setPicks([]);
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="display-caps text-2xl">
            Choose your bonus
          </DialogTitle>
          <DialogDescription>
            {maxPids === 1
              ? "This promotion gives you one item on the house."
              : `This promotion gives you ${maxPids} items on the house.`}
          </DialogDescription>
        </DialogHeader>

        {query.isPending ? (
          <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3">
            {[0, 1, 2].map((row) => (
              <li key={row} className="flex flex-col gap-3">
                <Skeleton className="aspect-[4/5] w-full" />
                <Skeleton className="h-3 w-2/3" />
              </li>
            ))}
          </ul>
        ) : products.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            This promotion has nothing left to offer.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3">
            {products.map((entry) => (
              <BonusProductCard
                key={entry.product.id}
                entry={entry}
                picked={picks.includes(entry.product.id)}
                disabled={full}
                onToggle={(pid, picked) =>
                  setPicks((current) =>
                    picked
                      ? [...current, pid]
                      : current.filter((chosen) => chosen !== pid)
                  )
                }
              />
            ))}
          </ul>
        )}

        {query.hasNextPage && (
          <Button
            variant="outline"
            className="label-caps h-11 self-start px-8"
            disabled={query.isFetchingNextPage}
            onClick={() => query.fetchNextPage()}
          >
            More
          </Button>
        )}

        <DialogFooter className="items-center gap-4 sm:justify-between">
          <span className="meta-caps text-muted-foreground">
            {picks.length} of {maxPids} chosen
          </span>
          <Button
            size="lg"
            className="label-caps h-13"
            disabled={!offer || picks.length === 0 || submit.isPending}
            onClick={() => {
              if (!offer) return;
              const chosen: BonusPick[] = picks.map((pid) => ({ pid, qty: 1 }));

              submit.mutate(
                {
                  uuid: offer.uuid,
                  pliUuid: offer.pliUuid,
                  maxPids: offer.maxPids,
                  picks: chosen,
                },
                {
                  onSuccess: (result) => {
                    toast.success(result.message || "Bonus added to bag");
                    setPicks([]);
                    onOpenChange(false);
                  },
                  onError: (error) => toast.error(error.message),
                }
              );
            }}
          >
            Add to bag
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
