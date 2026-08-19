import { ProductAvailability } from "./product-availability";
import { ProductGallery } from "./product-gallery";
import { ProductPrice } from "./product-price";
import { ProductPromotions } from "./product-promotions";
import { VariationSwatches } from "./variation-swatches";
import { AddToBag } from "@/components/commerce/cart/add-to-bag";
import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuickView, useVariation } from "@/lib/queries/product";
import { Eye } from "lucide-react";
import { useState } from "react";

function QuickViewSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="aspect-square w-full" />
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

/**
 * The PLP quick look.
 *
 * Base rendered product/quickView.isml to an HTML string for jQuery to inject;
 * here the endpoint returns the same typed product the PDP renders, so the
 * dialog is built from the very components the PDP uses.
 *
 * Selecting a variation must not navigate away from the grid, so the swatches
 * run in their handler mode and swap the product through Product-Variation.
 */
export function QuickView({ pid, name }: { pid: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [variationUrl, setVariationUrl] = useState<string | null>(null);

  const { data, isPending, isError } = useQuickView(pid, open);
  const variation = useVariation(variationUrl);

  // The variation response supersedes the opening one until the dialog closes.
  const product = variation.data?.product ?? data?.product;

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setVariationUrl(null);
      }}
    >
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="label-caps gap-2 rounded-none"
        >
          <Eye className="size-4" aria-hidden />
          Quick look
          <span className="sr-only"> at {name}</span>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full overflow-y-auto sm:max-w-lg"
        aria-describedby={undefined}
      >
        <SheetHeader>
          <SheetTitle className="display-caps text-left text-2xl">
            {product?.productName ?? name}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-4 pb-10">
          {isPending && <QuickViewSkeleton />}

          {isError && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              This product could not be loaded. Open the full page instead.
            </p>
          )}

          {product && (
            <>
              <ProductGallery product={product} />

              <ProductPrice price={product.price} />

              <VariationSwatches
                attributes={product.variationAttributes}
                onSelect={setVariationUrl}
              />

              <ProductAvailability availability={product.availability} />

              <ProductPromotions promotions={product.promotions} />

              <AddToBag product={product} onSelect={setVariationUrl} />
            </>
          )}

          {data && (
            <Link
              href={data.productUrl}
              onClick={() => setOpen(false)}
              className="link-draw label-caps self-start"
            >
              View full details
            </Link>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
