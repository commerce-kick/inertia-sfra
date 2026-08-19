import { AspectRatio } from "@/components/ui/aspect-ratio";
import { disSrcSet, disUrl } from "@/lib/dis";
import { cn } from "@/lib/utils";
import { ImageOff } from "lucide-react";
import { useState } from "react";

/**
 * A product photograph at a fixed size: the bag's lines, the checkout
 * summary, the confirmation, the account's last order.
 *
 * Two things it owns so no caller has to remember them:
 *
 * **It does not stretch.** These thumbnails sit in grid and flex rows whose
 * other column is much taller, and both layouts stretch their children by
 * default — which left the ground showing as a grey slab below the picture,
 * exactly as tall as the text beside it. `self-start` keeps the box the size
 * of the box.
 *
 * **It asks for the size it draws.** The URL goes through DIS with the
 * rendered dimensions and a 2x variant, rather than scaling a full-size
 * catalog asset in the browser.
 *
 * Bare photograph on Ground, no card chrome, per DESIGN.md — and the broken
 * fallback keeps the same geometry so a missing image never reflows a row.
 */
export function ProductThumb({
  image,
  width,
  ratio = 4 / 5,
  className,
}: {
  image: { url: string; alt: string } | null;
  /** Rendered width in CSS pixels — what DIS is asked for. */
  width: number;
  ratio?: number;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);
  const shown = broken ? null : image;
  const size = { width, height: Math.round(width / ratio) };

  return (
    <div className={cn("self-start overflow-hidden bg-muted", className)}>
      <AspectRatio ratio={ratio}>
        {shown ? (
          <img
            src={disUrl(shown.url, size)}
            srcSet={disSrcSet(shown.url, size)}
            alt={shown.alt}
            width={size.width}
            height={size.height}
            loading="lazy"
            onError={() => setBroken(true)}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-1.5 text-muted-foreground">
            <ImageOff className="size-4" aria-hidden />
            <span className="meta-caps">No photo</span>
          </div>
        )}
      </AspectRatio>
    </div>
  );
}
