import { AspectRatio } from "@/components/ui/aspect-ratio";
import type { IProductDetailData } from "@/generated/data";
import { ImageOff } from "lucide-react";
import { useState } from "react";

/** 1:1 gallery with thumbs — the fixed PDP crop from DESIGN.md's No-Chrome rule. */
function ProductGallery({ product }: { product: IProductDetailData }) {
  const [active, setActive] = useState(0);
  const image = product.images[active] ?? product.images[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden bg-muted">
        <AspectRatio ratio={1}>
          {image ? (
            <img
              key={image.url}
              src={image.url}
              alt={image.alt || product.productName}
              className="size-full object-cover motion-safe:animate-in motion-safe:fade-in motion-safe:duration-(--motion-base)"
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <ImageOff className="size-6" aria-hidden />
              <span className="text-xs">No photo</span>
            </div>
          )}
        </AspectRatio>
      </div>
      {product.images.length > 1 && (
        <div className="flex gap-2">
          {product.images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Photo ${i + 1}`}
              aria-pressed={i === active}
              className={`size-16 overflow-hidden border bg-muted transition-colors duration-(--motion-fast) ease-(--motion-ease) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                i === active
                  ? "border-foreground"
                  : "border-transparent hover:border-border"
              }`}
            >
              <img src={img.url} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export { ProductGallery };
