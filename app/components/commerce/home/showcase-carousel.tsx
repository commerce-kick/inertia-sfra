import { ProductTile } from "@/components/commerce/product-tile";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import type { ShowcaseRow } from "@/types/home";
import { useEffect, useRef, useState } from "react";

const pad2 = (n: number) => String(n).padStart(2, "0");

function ShowcaseCarousel({ row }: { row: ShowcaseRow }) {
  const [api, setApi] = useState<CarouselApi>();
  const [first, setFirst] = useState(1);
  const thumbRef = useRef<HTMLDivElement>(null);
  const total = row.products.length;

  // Progress hairline + counter read the carousel's real state: the ink
  // segment follows Embla's scrollProgress (transform-only, no re-render),
  // the mono readout names the first visible item — the mono-ticker device.
  useEffect(() => {
    if (!api) return;

    const onScroll = () => {
      const raw = api.scrollProgress();
      const progress = Number.isFinite(raw)
        ? Math.min(1, Math.max(0, raw))
        : 0;
      if (thumbRef.current) {
        thumbRef.current.style.transform = `translateX(${progress * 300}%)`;
      }
    };
    const onSlidesInView = () => {
      const visible = api.slidesInView();
      if (visible.length) setFirst(Math.min(...visible) + 1);
    };

    onScroll();
    onSlidesInView();
    api.on("scroll", onScroll);
    api.on("reInit", onScroll);
    api.on("slidesInView", onSlidesInView);
    return () => {
      api.off("scroll", onScroll);
      api.off("reInit", onScroll);
      api.off("slidesInView", onSlidesInView);
    };
  }, [api]);

  return (
    <div>
      <Carousel opts={{ align: "start" }} setApi={setApi} className="w-full">
        <CarouselContent className="-ml-5">
          {row.products.map((product, index) => (
            <CarouselItem
              key={product.id}
              className="basis-3/4 pl-5 sm:basis-2/5 lg:basis-[30%] xl:basis-1/4"
            >
              {/* Staggered fill: the deferred XHR lands as choreography,
                  each tile a beat behind the last (entrance device). */}
              <div
                className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-(--motion-slow) motion-safe:[animation-fill-mode:backwards]"
                style={{ animationDelay: `${Math.min(index, 5) * 60}ms` }}
              >
                <ProductTile product={product} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-4 hidden sm:inline-flex" />
        <CarouselNext className="-right-4 hidden sm:inline-flex" />
      </Carousel>
      <div className="mt-5 flex items-center gap-6">
        <div className="relative h-px flex-1 bg-border" aria-hidden>
          <div
            ref={thumbRef}
            className="absolute inset-y-0 left-0 w-1/4 bg-foreground"
          />
        </div>
        <span className="meta-caps tabular-nums text-muted-foreground">
          {pad2(first)} / {pad2(total)}
        </span>
      </div>
    </div>
  );
}

export { ShowcaseCarousel };
