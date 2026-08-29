import { ProductTileSkeleton } from "@/components/commerce/product-tile";
import { Section } from "@/components/commerce/section";
import { Link } from "@/components/link";
import { ShowcaseCarousel } from "./showcase-carousel";
import type { CategoryShowcaseEntry, ShowcaseRow } from "@/types/home";
import { Deferred } from "@inertiajs/react";
import { ArrowRight } from "lucide-react";

/**
 * Deferred fallback mirroring what actually arrives: one skeleton row per
 * showcased category (the controller sends up to three), titled with the
 * real category names so the fill never relabels or reflows the page.
 */
function ShowcaseFallback({
  categories,
}: {
  categories: CategoryShowcaseEntry[];
}) {
  const rows = categories.slice(0, 3);
  if (rows.length === 0) return null;

  return (
    <>
      {rows.map((category) => (
        <Section
          key={category.id}
          title={category.name}
          meta="loading · deferred"
          className="pt-12"
          rule={false}
        >
          <div className="flex gap-5 overflow-hidden">
            {Array.from({ length: 4 }, (_, i) => (
              <ProductTileSkeleton
                key={i}
                className="w-[70%] shrink-0 sm:w-[36%] lg:w-[27%] xl:w-[22%]"
              />
            ))}
          </div>
        </Section>
      ))}
    </>
  );
}

/**
 * The deferred product rows. One XHR fills every row after first paint; until
 * it lands the fallback holds the exact shape that arrives.
 */
function ShowcaseRows({
  categories,
  showcases,
}: {
  categories: CategoryShowcaseEntry[];
  showcases?: ShowcaseRow[];
}) {
  return (
    <Deferred
      data="showcases"
      fallback={<ShowcaseFallback categories={categories} />}
    >
      <>
        {(showcases ?? []).map((row) => (
          <Section
            key={row.categoryId}
            title={row.title}
            meta={`${row.products.length} items · one XHR`}
            rule={false}
            className="pt-12 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-(--motion-slow)"
            action={
              <Link
                href={row.url}
                className="link-draw label-caps inline-flex items-center gap-2"
              >
                View all
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            }
          >
            <ShowcaseCarousel row={row} />
          </Section>
        ))}
      </>
    </Deferred>
  );
}

export { ShowcaseRows };
