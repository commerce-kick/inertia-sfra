import { Barcode } from "@/components/commerce/barcode";
import { CategoryCard } from "@/components/commerce/category-card";
import { HangTag } from "@/components/commerce/hang-tag";
import {
  ProductTile,
  ProductTileSkeleton,
} from "@/components/commerce/product-tile";
import { Section } from "@/components/commerce/section";
import { Link } from "@/components/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { HomeShowProps, ShowcaseRow } from "@/types/home";
import { Deferred, Head, usePage } from "@inertiajs/react";
import { ArrowRight } from "lucide-react";

/** Authored hero art: a kraft parcel wrapped in tissue, tied with twine. */
function WrappedParcel() {
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-sm">
      {/* loose tissue sheets under the parcel */}
      <div className="absolute inset-4 -rotate-6 bg-card/50 shadow-sm" />
      <div className="absolute inset-2 rotate-3 bg-card/70 shadow-sm" />
      {/* the parcel: kraft paper with visible fold planes */}
      <div className="relative aspect-[4/3] -rotate-1 overflow-hidden shadow-xl [background:linear-gradient(135deg,oklch(0.76_0.06_72)_0%,oklch(0.7_0.065_70)_55%,oklch(0.65_0.07_68)_100%)] dark:[background:linear-gradient(135deg,oklch(0.45_0.05_70),oklch(0.38_0.045_70))]">
        {/* fold creases */}
        <div className="absolute left-0 top-[18%] h-px w-full bg-black/10" />
        <div className="absolute left-0 top-[18%] h-px w-full translate-y-px bg-white/20" />
        <div className="absolute bottom-[14%] left-0 h-px w-full bg-black/10" />
        {/* tissue peeking out of the top fold */}
        <div className="absolute -top-1 left-[12%] h-4 w-[30%] -rotate-2 bg-card shadow-xs" />
        <div className="absolute -top-1 right-[18%] h-3 w-[22%] rotate-3 bg-card/90 shadow-xs" />
        {/* twine cross with woven shadow */}
        <div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-secondary-foreground/55 shadow-[1px_0_0_rgba(255,255,255,0.25)]" />
        <div className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 bg-secondary-foreground/55 shadow-[0_1px_0_rgba(255,255,255,0.25)]" />
        {/* bow: two loops + knot */}
        <div className="absolute left-1/2 top-1/2 size-9 -translate-x-[85%] -translate-y-1/2 rounded-full border-[3px] border-secondary-foreground/55 bg-transparent [clip-path:polygon(0_0,78%_0,78%_100%,0_100%)]" />
        <div className="absolute left-1/2 top-1/2 size-9 -translate-x-[15%] -translate-y-1/2 rounded-full border-[3px] border-secondary-foreground/55 bg-transparent [clip-path:polygon(22%_0,100%_0,100%_100%,22%_100%)]" />
        <div className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary-foreground/70 shadow-sm" />
        {/* postage stamp corner */}
        <div className="absolute right-[7%] top-[6%] rotate-2 border-2 border-dashed border-primary/70 px-2 py-1">
          <span className="stamp-display text-[10px] text-primary/80">
            Meridian
          </span>
        </div>
      </div>
      {/* the tag, hanging off the twine */}
      <HangTag tilt={9} className="absolute -right-6 top-[70%] scale-110">
        <span className="flex flex-col items-start gap-0.5 py-0.5">
          <span className="ticket-caps text-[10px]">Para ti</span>
          <Barcode value="MERIDIAN" showLabel={false} className="w-16 text-foreground/40" />
        </span>
      </HangTag>
    </div>
  );
}

function ShowcaseCarousel({ row }: { row: ShowcaseRow }) {
  return (
    <Carousel opts={{ align: "start" }} className="w-full">
      <CarouselContent className="-ml-5">
        {row.products.map((product) => (
          <CarouselItem
            key={product.id}
            className="basis-3/4 pl-5 sm:basis-2/5 lg:basis-[30%] xl:basis-1/4"
          >
            <ProductTile product={product} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="-left-3 hidden rounded-none sm:inline-flex" />
      <CarouselNext className="-right-3 hidden rounded-none sm:inline-flex" />
    </Carousel>
  );
}

function ShowcaseSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <ProductTileSkeleton key={i} className={i > 1 ? "hidden lg:flex" : ""} />
      ))}
    </div>
  );
}

export default function Show() {
  const { categoryShowcase, showcases } = usePage<HomeShowProps>().props;
  const firstCategory = categoryShowcase[0];

  return (
    <>
      <Head title="Meridian — todo lo bueno llega envuelto" />

      {/* HERO — full-bleed kraft field, the wrapping room */}
      <section className="bg-secondary text-secondary-foreground">
        <div className="container grid min-h-[70vh] items-center gap-12 py-16 lg:grid-cols-[3fr_2fr] lg:py-20">
          <div className="flex max-w-2xl flex-col items-start gap-8">
            <h1 className="stamp-display text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.95]">
              Todo lo bueno llega envuelto
            </h1>
            <p className="max-w-md text-base leading-relaxed opacity-85 sm:text-lg">
              Relojes y accesorios etiquetados a mano: papel de seda, cordel y
              una etiqueta con tu nombre.
            </p>
            {firstCategory && (
              <Link
                href={firstCategory.url}
                className="group focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                <HangTag
                  tilt={-2}
                  className="text-primary transition-transform duration-300 ease-out group-hover:rotate-0"
                >
                  <span className="ticket-caps flex items-center gap-2 py-0.5 text-sm">
                    Abrir la colección
                    <ArrowRight className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
                  </span>
                </HangTag>
              </Link>
            )}
          </div>
          <WrappedParcel />
        </div>
        <div className="border-t border-secondary-foreground/20">
          <div className="container flex items-center justify-between gap-6 py-3">
            <span className="font-mono text-[11px] uppercase tracking-widest opacity-70">
              Temporada actual · envuelto a mano
            </span>
            <Barcode value="EDICION-DE-OTONO" className="w-32 opacity-50" />
          </div>
        </div>
      </section>

      {/* CATEGORY TICKETS */}
      <Section title="Colecciones" meta={`${categoryShowcase.length} tickets`}>
        <div className="grid gap-5 sm:grid-cols-2">
          {categoryShowcase.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </Section>

      {/* DEFERRED PRODUCT ROWS — one XHR fills every row after first paint */}
      <Deferred
        data="showcases"
        fallback={
          <Section title="Recién etiquetado" meta="cargando">
            <ShowcaseSkeleton />
          </Section>
        }
      >
        <>
          {(showcases ?? []).map((row) => (
            <Section
              key={row.categoryId}
              title={row.title}
              meta={`${row.products.length} artículos`}
              action={
                <Link
                  href={row.url}
                  className="ticket-caps text-xs text-primary underline-offset-4 hover:underline"
                >
                  Ver todo
                </Link>
              }
            >
              <ShowcaseCarousel row={row} />
            </Section>
          ))}
        </>
      </Deferred>

      {/* EDITORIAL CLOSE */}
      <section className="container pt-24">
        <div className="relative mx-auto max-w-3xl bg-card px-8 py-14 text-center shadow-sm sm:px-16">
          <div className="absolute inset-x-8 top-0 border-t-2 border-dashed border-secondary-foreground/30 sm:inset-x-16" />
          <p className="stamp-display text-xl leading-snug text-foreground sm:text-2xl">
            Envolver es una forma de decir: esto importa.
          </p>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
            Cada pedido sale de nuestro taller con papel de seda, cordel y su
            ticket numerado — la misma atención con la que elegiste lo que hay
            dentro.
          </p>
          <div className="mt-8 flex justify-center">
            <Barcode value="HECHO-CON-CUIDADO" className="w-28 text-foreground/30" />
          </div>
        </div>
      </section>
    </>
  );
}
