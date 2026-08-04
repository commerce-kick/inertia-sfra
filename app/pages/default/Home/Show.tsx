import { CategoryCard } from "@/components/commerce/category-card";
import {
  ProductTile,
  ProductTileSkeleton,
} from "@/components/commerce/product-tile";
import { Section } from "@/components/commerce/section";
import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { HomeShowProps, ShowcaseRow } from "@/types/home";
import { Deferred, Head, usePage } from "@inertiajs/react";
import { ArrowRight, Blocks, Layers, Zap } from "lucide-react";

/**
 * Authored hero visual: a soft gradient panel with floating product-card
 * silhouettes — the storefront's own UI as illustration.
 */
function HeroVisual() {
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-md">
      <div className="absolute -inset-8 rounded-full bg-[radial-gradient(closest-side,oklch(0.72_0.17_55/0.18),transparent)]" />
      <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-primary/90 via-primary to-[oklch(0.62_0.19_40)] p-6 shadow-xl">
        {/* floating card silhouettes */}
        <div className="absolute left-6 top-8 flex w-36 flex-col gap-2 rounded-lg bg-background p-3 shadow-lg">
          <div className="aspect-[4/3] rounded-md bg-muted" />
          <div className="h-2.5 w-3/4 rounded bg-muted" />
          <div className="h-2.5 w-1/3 rounded bg-primary/30" />
        </div>
        <div className="absolute bottom-10 right-6 flex w-40 flex-col gap-2 rounded-lg bg-background p-3 shadow-lg">
          <div className="aspect-[4/3] rounded-md bg-muted" />
          <div className="h-2.5 w-2/3 rounded bg-muted" />
          <div className="h-2.5 w-1/2 rounded bg-primary/30" />
        </div>
        <div className="absolute bottom-24 left-16 flex w-32 flex-col gap-2 rounded-lg bg-background/95 p-3 shadow-md">
          <div className="h-2.5 w-full rounded bg-muted" />
          <div className="h-2.5 w-2/3 rounded bg-muted" />
          <div className="mt-1 h-6 w-20 rounded-md bg-primary/80" />
        </div>
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
      <CarouselPrevious className="-left-4 hidden sm:inline-flex" />
      <CarouselNext className="-right-4 hidden sm:inline-flex" />
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

const STACK_CARDS = [
  {
    icon: Blocks,
    title: "Controladores SFRA",
    body: "Los controladores, middleware y sesión de Salesforce B2C Commerce siguen intactos en el servidor.",
  },
  {
    icon: Layers,
    title: "Protocolo Inertia v2",
    body: "Partial reloads, props diferidas, scroll infinito y flash — el protocolo completo, adaptado a SFCC.",
  },
  {
    icon: Zap,
    title: "React 19 + Vite",
    body: "Frontend moderno con HMR, TypeScript de punta a punta y componentes shadcn/ui.",
  },
];

export default function Show() {
  const { categoryShowcase, showcases } = usePage<HomeShowProps>().props;
  const [firstCategory, secondCategory] = categoryShowcase;

  return (
    <>
      <Head title="Meridian — relojes y accesorios" />

      {/* HERO */}
      <section className="border-b bg-gradient-to-b from-muted/60 to-background">
        <div className="container grid items-center gap-12 py-16 lg:grid-cols-[3fr_2fr] lg:py-24">
          <div className="flex max-w-2xl flex-col items-start gap-6">
            <h1 className="text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              El tiempo, bien&nbsp;elegido.
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
              Relojes y accesorios seleccionados para el día a día — un
              catálogo corto, elegido con criterio.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {firstCategory && (
                <Button asChild size="lg" className="font-semibold">
                  <Link href={firstCategory.url}>
                    Explorar {firstCategory.name.toLowerCase()}
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Button>
              )}
              {secondCategory && (
                <Button asChild size="lg" variant="outline">
                  <Link href={secondCategory.url}>
                    Ver {secondCategory.name.toLowerCase()}
                  </Link>
                </Button>
              )}
            </div>
          </div>
          <HeroVisual />
        </div>
      </section>

      {/* CATEGORIES */}
      <Section
        title="Colecciones"
        subtitle="Dos líneas, elegidas con criterio."
      >
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
          <Section title="Novedades" meta="cargando">
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
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-link underline-offset-4 hover:underline"
                >
                  Ver todo
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              }
            >
              <ShowcaseCarousel row={row} />
            </Section>
          ))}
        </>
      </Deferred>

      {/* THE STACK — the honest pitch to the storefront's real audience */}
      <Section
        title="Construido sobre Inertia + SFRA"
        subtitle="Este escaparate es la implementación de referencia open-source del adaptador Inertia.js para Salesforce B2C Commerce."
      >
        <div className="grid gap-5 md:grid-cols-3">
          {STACK_CARDS.map((card) => (
            <div
              key={card.title}
              className="flex flex-col gap-3 rounded-lg border bg-card p-6"
            >
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <card.icon className="size-5" aria-hidden />
              </span>
              <h3 className="font-semibold">{card.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
