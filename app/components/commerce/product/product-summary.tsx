import { ProductAvailability } from "./product-availability";
import { ProductDetails } from "./product-details";
import { ProductPromotions } from "./product-promotions";
import { ProductPrice } from "./product-price";
import { SizeChart } from "./size-chart";
import { VariationSwatches } from "./variation-swatches";
import { Button } from "@/components/ui/button";
import type { IProductDetailData } from "@/generated/data";
import type { Crumb } from "@/types/product";
import { Star } from "lucide-react";

/**
 * The PDP's right column: identity, price, variations, availability, the cart
 * CTA, the catalog description, and the spec table. Sticky beside the gallery
 * from `lg` (DESIGN.md layout numbers).
 */
function ProductSummary({
  product,
  categoryCrumb,
}: {
  product: IProductDetailData;
  categoryCrumb?: Crumb;
}) {
  return (
    <div className="flex max-w-xl flex-col items-start gap-6 lg:sticky lg:top-24 lg:self-start">
      <div className="flex flex-col gap-3">
        <h1 className="display-caps text-3xl sm:text-4xl">
          {product.productName}
        </h1>
        <div className="flex items-center gap-3">
          <span className="meta-caps text-muted-foreground">
            {product.id}
          </span>
          {product.rating > 0 && (
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              <Star
                className="size-4 fill-primary text-primary"
                aria-hidden
              />
              {product.rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>

      <ProductPrice price={product.price} />

      <VariationSwatches attributes={product.variationAttributes} />

      <SizeChart product={product} />

      <ProductAvailability availability={product.availability} />

      <ProductPromotions promotions={product.promotions} />
      
      <div className="flex w-full flex-col items-start gap-2.5 pt-2">
        <Button
          size="lg"
          disabled
          className="label-caps h-13 w-full max-w-sm"
          title="The cart flow arrives in the next phase"
        >
          Add to bag
        </Button>
        <span className="meta-caps text-muted-foreground">
          Cart coming soon · demo in progress
        </span>
      </div>
      
      {product.description && (
        <div className="flex w-full flex-col gap-3 border-t pt-6">
          <h2 className="label-caps">Description</h2>
          <div
            className="cms-body max-w-none"
            // Server-authored catalog markup (Business Manager content).
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>
      )}

      <ProductDetails product={product} categoryCrumb={categoryCrumb} />
    </div>
  );
}

export { ProductSummary };
