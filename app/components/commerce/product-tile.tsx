import { Link } from "@/components/link";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";
import type { ISearchTileData } from "@/generated/data";
import { ImageOff, Star } from "lucide-react";
import { useState } from "react";

function TilePrice({ price }: { price: ISearchTileData["price"] }) {
  if (!price) return null;
  if (price.isRange && price.min && price.max) {
    return (
      <span className="text-sm font-semibold">
        {price.min.formatted}–{price.max.formatted}
      </span>
    );
  }
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="text-sm font-semibold">{price.sales?.formatted}</span>
      {price.list && (
        <s className="text-xs text-muted-foreground">{price.list.formatted}</s>
      )}
    </span>
  );
}

/**
 * Product card: bordered white card, product photo on a soft ground, name,
 * price, color swatches, rating. Hover lifts the card and warms the border.
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
        "group flex flex-col overflow-hidden rounded-lg border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md",
        "focus-visible:outline-2 focus-visible:outline-offset-2",
        className
      )}
    >
      <div className="border-b bg-muted/50">
        <AspectRatio ratio={4 / 5}>
          {image ? (
            <img
              src={image.url}
              alt={image.alt || product.productName}
              loading="lazy"
              onError={() => setImageBroken(true)}
              className="size-full object-contain p-6 transition-transform duration-200 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <ImageOff className="size-6" aria-hidden />
              <span className="text-xs">Sin foto</span>
            </div>
          )}
        </AspectRatio>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium leading-snug">
            {product.productName}
          </h3>
          {product.rating > 0 && (
            <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
              <Star
                className="size-3.5 fill-primary text-primary"
                aria-hidden
              />
              {product.rating.toFixed(1)}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <TilePrice price={product.price} />
          {colors && colors.values.length > 0 && (
            <span className="flex items-center gap-1" aria-label="Colores">
              {colors.values.slice(0, 5).map((value) =>
                value.image ? (
                  <img
                    key={value.id}
                    src={value.image.url}
                    alt={value.displayValue}
                    title={value.displayValue}
                    className="size-4 rounded-full border object-cover"
                  />
                ) : (
                  <span
                    key={value.id}
                    title={value.displayValue}
                    className="size-4 rounded-full border bg-muted"
                  />
                )
              )}
              {colors.values.length > 5 && (
                <span className="text-[10px] text-muted-foreground">
                  +{colors.values.length - 5}
                </span>
              )}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function ProductTileSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex animate-pulse flex-col overflow-hidden rounded-lg border bg-card",
        className
      )}
    >
      <div className="border-b bg-muted">
        <AspectRatio ratio={4 / 5} />
      </div>
      <div className="flex flex-col gap-2.5 p-4">
        <div className="h-3.5 w-3/4 rounded bg-muted" />
        <div className="h-3.5 w-1/3 rounded bg-muted" />
      </div>
    </div>
  );
}
