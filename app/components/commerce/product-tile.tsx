import { Barcode } from "@/components/commerce/barcode";
import { HangTag } from "@/components/commerce/hang-tag";
import { Link } from "@/components/link";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";
import type { ISearchTileData } from "@/generated/data";
import { Star } from "lucide-react";
import { useState } from "react";

function TilePrice({ price }: { price: ISearchTileData["price"] }) {
  if (!price) return null;
  if (price.isRange && price.min && price.max) {
    return (
      <span className="font-mono text-sm font-semibold">
        {price.min.formatted}–{price.max.formatted}
      </span>
    );
  }
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="font-mono text-sm font-semibold">
        {price.sales?.formatted}
      </span>
      {price.list && (
        <s className="font-mono text-[11px] text-muted-foreground decoration-primary decoration-2">
          {price.list.formatted}
        </s>
      )}
    </span>
  );
}

/**
 * A ticketed good: product image on tissue, the price on a swing tag
 * hanging over the photo's corner, name in ticket caps, color swatches as
 * stitched dots, SKU as a barcode strip.
 */
export function ProductTile({
  product,
  className,
}: {
  product: ISearchTileData;
  className?: string;
}) {
  const colors = product.variationAttributes.find((attr) => attr.swatchable);
  const [imageBroken, setImageBroken] = useState(false);
  const image = imageBroken ? null : product.image;

  return (
    <Link
      href={product.url}
      className={cn(
        "group relative flex flex-col gap-3 focus-visible:outline-2 focus-visible:outline-offset-4",
        className
      )}
    >
      <div className="relative bg-card shadow-xs transition-shadow duration-300 group-hover:shadow-md">
        <AspectRatio ratio={4 / 5}>
          {image ? (
            <img
              src={image.url}
              alt={image.alt || product.productName}
              loading="lazy"
              onError={() => setImageBroken(true)}
              className="size-full object-contain p-6 transition-transform duration-300 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <span className="ticket-caps text-muted-foreground">
                Sin foto
              </span>
            </div>
          )}
        </AspectRatio>
        <HangTag
          tilt={-4}
          className="absolute -bottom-2 left-4 transition-transform duration-300 ease-out group-hover:-rotate-2"
        >
          <TilePrice price={product.price} />
        </HangTag>
      </div>

      <div className="flex flex-col gap-1.5 px-1 pt-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="ticket-caps text-sm leading-snug">
            {product.productName}
          </h3>
          {product.rating > 0 && (
            <span className="inline-flex shrink-0 items-center gap-0.5 font-mono text-[11px] text-muted-foreground">
              <Star className="size-3 fill-current text-secondary-foreground/70" />
              {product.rating.toFixed(1)}
            </span>
          )}
        </div>

        <div className="flex items-end justify-between gap-2">
          {colors && colors.values.length > 0 ? (
            <span className="flex items-center gap-1" aria-label="Colores">
              {colors.values.slice(0, 5).map((value) =>
                value.image ? (
                  <img
                    key={value.id}
                    src={value.image.url}
                    alt={value.displayValue}
                    title={value.displayValue}
                    className="size-3.5 rounded-full border border-border object-cover"
                  />
                ) : (
                  <span
                    key={value.id}
                    title={value.displayValue}
                    className="size-3.5 rounded-full border border-border bg-muted"
                  />
                )
              )}
              {colors.values.length > 5 && (
                <span className="font-mono text-[10px] text-muted-foreground">
                  +{colors.values.length - 5}
                </span>
              )}
            </span>
          ) : (
            <span />
          )}
          <Barcode
            value={product.id}
            showLabel={false}
            className="w-12 text-foreground/30"
          />
        </div>
      </div>
    </Link>
  );
}

export function ProductTileSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex animate-pulse flex-col gap-3", className)}>
      <div className="bg-muted">
        <AspectRatio ratio={4 / 5} />
      </div>
      <div className="flex flex-col gap-2 px-1">
        <div className="h-3.5 w-3/4 bg-muted" />
        <div className="h-3 w-1/3 bg-muted" />
      </div>
    </div>
  );
}
