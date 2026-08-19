import { ProductAvailability } from "@/components/commerce/product/product-availability";
import { ProductPrice } from "@/components/commerce/product/product-price";
import {
  OptionSelects,
  QuantitySelect,
} from "@/components/commerce/product/product-selects";
import { VariationSwatches } from "@/components/commerce/product/variation-swatches";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { ICartLineItemData } from "@/generated/data";
import { useCartProduct, useEditLineItem } from "@/lib/queries/cart";
import { useVariation } from "@/lib/queries/product";
import { useState } from "react";
import { toast } from "sonner";

/**
 * Edit a line without leaving the bag: swap the variant, change the quantity,
 * choose a different option.
 *
 * Base opened product/quickView.isml in a modal for this; the product arrives
 * typed instead, so the dialog is the same components the PDP is built from.
 * As in quickview, nothing may navigate — every re-resolution goes through
 * Product-Variation and swaps the product in place, and what the shopper is
 * looking at when they press Update is what gets written to the line.
 */
export function EditLineItem({ item }: { item: ICartLineItemData }) {
  const [open, setOpen] = useState(false);
  const [variationUrl, setVariationUrl] = useState<string | null>(null);

  const { data, isPending } = useCartProduct(open ? item.uuid : null);
  const variation = useVariation(variationUrl);
  const edit = useEditLineItem();

  // The variation response supersedes the opening one until the dialog closes.
  const product = variation.data?.product ?? data?.product ?? null;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setVariationUrl(null);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="label-caps self-start px-0">
          Edit
          <span className="sr-only"> {item.productName}</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="display-caps text-2xl">
            {product?.productName ?? item.productName}
          </DialogTitle>
          <DialogDescription>
            Change what this line carries. Your bag updates when you save.
          </DialogDescription>
        </DialogHeader>

        {isPending && (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}

        {data?.error && (
          <p className="text-sm text-destructive">{data.errorMessage}</p>
        )}

        {product && (
          <div className="flex flex-col gap-6">
            <ProductPrice price={product.price} />
            <VariationSwatches
              attributes={product.variationAttributes}
              onSelect={setVariationUrl}
            />
            <QuantitySelect product={product} onSelect={setVariationUrl} />
            <OptionSelects product={product} onSelect={setVariationUrl} />
            <ProductAvailability availability={product.availability} />
          </div>
        )}

        <DialogFooter>
          <Button
            size="lg"
            className="label-caps h-13"
            disabled={!product || !product.readyToOrder || edit.isPending}
            onClick={() => {
              if (!product) return;

              edit.mutate(
                {
                  uuid: item.uuid,
                  pid: product.id,
                  quantity: product.selectedQuantity,
                  selectedOptionValueId: product.options[0]?.selectedValueId,
                },
                {
                  onSuccess: () => {
                    toast.success("Bag updated");
                    setOpen(false);
                  },
                  onError: (error) => toast.error(error.message),
                }
              );
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
