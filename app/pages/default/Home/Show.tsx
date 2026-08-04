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

/** Authored hero art: a tissue-wrapped parcel tied with twine, CSS-only. */
function WrappedParcel() {
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-sm">
      {/* tissue sheets under the parcel */}
      <div className="absolute inset-4 -rotate-6 bg-card/60 shadow-sm" />
      <div className="absolute inset-2 rotate-3 bg-card/80 shadow-sm" />
      {/* the parcel */}
      <div className="relative aspect-[4/3] -rotate-1 bg-card shadow-lg">
        {/* folded flap */}
        <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-background/70 to-transparent" />
        {/* twine cross */}
        <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-secondary-foreground/50" />
        <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-secondary-foreground/50" />
        {/* knot */}
        <div className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-secondary-foreground/60 bg-card" />
        <HangTag tilt={8} className="absolute -right-5 top-2/3">
          <span className="flex flex-col items-start gap-0.5 py-0.5">
            <span className="ticket-caps text-[10px]">Para ti</span>
            <Barcode value="MERIDIAN" showLabel={false} className="w-14 text-foreground/40" />
          </span>
        </HangTag>
      </div>
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
      <CarouselPrevious className="-left-3 rounded-none" />
      <CarouselNext className="-right-3 rounded-none" />
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
