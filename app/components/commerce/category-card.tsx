import { Link } from "@/components/link";
import { cn } from "@/lib/utils";
import type { CategoryShowcaseEntry } from "@/types/home";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

/**
 * Collection panel: full-bleed photograph under a bottom scrim, the
 * category name at display scale. Without imagery (or when the image
 * fails) the panel inverts and the name itself becomes the image — type
 * as photograph. The caps are white only over a scrimmed photograph;
 * on the bare inverted panel they take the panel's own ink so the
 * Inverted-Twin rule holds in dark mode.
 */
export function CategoryCard({ category }: { category: CategoryShowcaseEntry }) {
  const [imageFailed, setImageFailed] = useState(false);
  const hasImage = Boolean(category.image) && !imageFailed;

  return (
    <Link
      href={category.url}
      className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden bg-foreground text-background sm:aspect-[16/10] focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      {category.image && !imageFailed && (
        <>
          <img
            src={category.image.url}
            alt=""
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="absolute inset-0 size-full object-cover transition-transform duration-(--motion-hero) ease-(--motion-ease) group-hover:scale-[1.03]"
          />
          {/* scrim keeps the caps legible on any photograph */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 to-transparent"
          />
        </>
      )}
      <div
        className={cn(
          "relative flex items-end justify-between gap-4 p-6 sm:p-8",
          hasImage && "text-white"
        )}
      >
        <h3 className="display-caps text-4xl sm:text-5xl">{category.name}</h3>
        <span className="label-caps hidden items-center gap-2 pb-1.5 sm:inline-flex">
          View the collection
          <ArrowRight
            className="size-4 transition-transform duration-(--motion-base) ease-(--motion-ease) group-hover:translate-x-1"
            aria-hidden
          />
        </span>
      </div>
    </Link>
  );
}
