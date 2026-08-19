import { QuickView } from "@/components/commerce/product/quick-view";
import { Link } from "@/components/link";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { disSrcSet, disUrl } from "@/lib/dis";
import { cn } from "@/lib/utils";
import type { ISearchTileData } from "@/generated/data";
import { ImageOff, Star } from "lucide-react";
import { useState } from "react";

/** The widest a tile is drawn, in the 4:5 crop the lookbook uses. */
const TILE_SIZE = { width: 460, height: 575 };

function TilePrice({ price }: { price: ISearchTileData["price"] }) {
  if (!price) return null;
  if (price.isRange && price.min && price.max) {
    return (
      <span className="meta-caps">
        {price.min.formatted}–{price.max.formatted}
      </span>
    );
  }
  return (
    <span className="inline-flex items-baseline gap-2">
      <span className="meta-caps">{price.sales?.formatted}</span>
      {price.list && (
        <s className="meta-caps text-muted-foreground">{price.list.formatted}</s>
      )}
    </span>
  );
}

/**
 * Lookbook tile: bare photograph on a quiet ground, caps name and mono
 * price beneath — no card chrome. Hover scales the image and underlines
 * the name; depth never comes from elevation in this world.
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
    // The quick-look control is a sibling of the link, never inside it —
    // nesting a button in an anchor is invalid and breaks keyboard order.
    <div
      className={cn(
        "group flex flex-col gap-3",
        "motion-safe:animate-in motion-safe:fade-in motion-safe:duration-(--motion-base)",
        className
      )}
    >
      <Link
        href={product.url}
        className="flex flex-col gap-3 focus-visible:outline-2 focus-visible:outline-offset-4"
      >
      <div className="overflow-hidden bg-muted">
        <AspectRatio ratio={4 / 5}>
          {image ? (
            <img
              // The grid draws a tile between roughly 180px (two columns on a
              // phone) and 460px (three on a wide screen); DIS is asked for
              // the widest, which every narrower one draws down into, plus
              // the 2x variant for retina.
              src={disUrl(image.url, TILE_SIZE)}
              srcSet={disSrcSet(image.url, TILE_SIZE)}
              alt={image.alt || product.productName}
              loading="lazy"
              onError={() => setImageBroken(true)}
              className="size-full object-cover transition-transform duration-(--motion-slow) ease-(--motion-ease) group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <ImageOff className="size-6" aria-hidden />
              <span className="label-caps">No photo</span>
            </div>
          )}
        </AspectRatio>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="label-caps -ml-1 inline-block px-1 py-0.5 leading-relaxed transition-colors duration-(--motion-fast) group-hover:bg-foreground group-hover:text-background">
            {product.productName}
          </h3>
          {product.rating > 0 && (
            <span className="meta-caps inline-flex shrink-0 items-center gap-1 text-muted-foreground">
              <Star className="size-3 fill-current" aria-hidden />
              {product.rating.toFixed(1)}
            </span>
          )}
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <TilePrice price={product.price} />
          {colors && colors.values.length > 0 && (
            <span className="meta-caps text-muted-foreground">
              {colors.values.length}{" "}
              {colors.values.length === 1 ? "color" : "colors"}
            </span>
          )}
        </div>
      </div>
      </Link>

      {/* Below the photograph, never over it — DESIGN.md's No-Chrome rule.
          Revealed on hover or keyboard focus, and always present where there
          is no hover to reveal it. It holds its space either way, so the grid
          never reflows. */}
      <div className="opacity-0 transition-opacity duration-(--motion-fast) ease-(--motion-ease) group-focus-within:opacity-100 group-hover:opacity-100 max-sm:opacity-100">
        <QuickView pid={product.id} name={product.productName} />
      </div>
    </div>
  );
}

export function ProductTileSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex animate-pulse flex-col gap-3", className)}>
      <div className="bg-muted">
        <AspectRatio ratio={4 / 5} />
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-3 w-3/4 bg-muted" />
        <div className="h-3 w-1/3 bg-muted" />
      </div>
    </div>
  );
}
