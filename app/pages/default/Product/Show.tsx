import { Link } from "@/components/link";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import type { IProductDetailData } from "@/generated/data";
import { homeShow } from "@/generated/routes/home-show";
import type { ProductShowProps } from "@/types/product";
import { Head, usePage } from "@inertiajs/react";
import { ImageOff, Star } from "lucide-react";
import { Fragment, useState } from "react";

function PdpPrice({ price }: { price: IProductDetailData["price"] }) {
  if (!price) return null;
  return (
    <div className="flex items-baseline gap-2.5">
      <span className="text-2xl font-bold">
        {price.isRange && price.min && price.max
          ? `${price.min.formatted}–${price.max.formatted}`
          : price.sales?.formatted}
      </span>
      {price.list && (
        <s className="text-base text-muted-foreground">{price.list.formatted}</s>
      )}
    </div>
  );
}

function Gallery({ product }: { product: IProductDetailData }) {
  const [active, setActive] = useState(0);
  const image = product.images[active] ?? product.images[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-lg border bg-muted/40">
        <AspectRatio ratio={1}>
          {image ? (
            <img
              src={image.url}
              alt={image.alt || product.productName}
              className="size-full object-contain p-10"
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <ImageOff className="size-6" aria-hidden />
              <span className="text-xs">Sin foto</span>
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
              aria-label={`Foto ${i + 1}`}
              className={`size-16 overflow-hidden rounded-md border bg-card p-2 transition-all ${
                i === active
                  ? "border-primary ring-1 ring-primary"
                  : "hover:border-primary/40"
              }`}
            >
              <img src={img.url} alt="" className="size-full object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Show() {
  const { product, breadcrumbs } = usePage<ProductShowProps>().props;

  return (
    <>
      <Head title={`${product.productName} — Meridian`} />

      <div className="container flex flex-col gap-8 py-8">
        <Breadcrumb>
          <BreadcrumbList className="text-xs">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={homeShow({})}>Inicio</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbs.map((crumb) => (
              <Fragment key={crumb.htmlValue}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {crumb.url ? (
                    <BreadcrumbLink asChild>
                      <Link href={crumb.url}>{crumb.htmlValue}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{crumb.htmlValue}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid gap-10 lg:grid-cols-2">
          <Gallery product={product} />

          <div className="flex max-w-xl flex-col items-start gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {product.productName}
              </h1>
              <div className="flex items-center gap-3">
                <span className="meta-caps text-muted-foreground">
                  {product.id}
                </span>
                {product.rating > 0 && (
                  <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                    <Star
                      className="size-4 fill-primary text-primary"
                      aria-hidden
                    />
                    {product.rating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>

            <PdpPrice price={product.price} />

            {product.variationAttributes.map((attr) => (
              <div key={attr.id} className="flex flex-col gap-2">
                <span className="text-sm font-medium">
                  {attr.displayName || attr.id}
                </span>
                <div className="flex flex-wrap gap-2">
                  {attr.values.map((value) =>
                    attr.swatchable && value.image ? (
                      <span
                        key={value.id}
                        title={value.displayValue}
                        className={`size-9 overflow-hidden rounded-full border-2 ${
                          value.selected
                            ? "border-primary"
                            : "border-transparent shadow-xs"
                        }`}
                      >
                        <img
                          src={value.image.url}
                          alt={value.displayValue}
                          className="size-full object-cover"
                        />
                      </span>
                    ) : (
                      <Badge
                        key={value.id}
                        variant={value.selected ? "default" : "outline"}
                        className="rounded-md px-3 py-1"
                      >
                        {value.displayValue}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            ))}

            <div className="flex items-center gap-2">
              <span
                className={`size-2 rounded-full ${
                  product.availability.available
                    ? "bg-chart-3"
                    : "bg-destructive"
                }`}
                aria-hidden
              />
              <span className="text-sm text-muted-foreground">
                {product.availability.available
                  ? "En stock"
                  : product.availability.messages[0] || "No disponible"}
              </span>
            </div>

            {product.description && (
              <div
                className="max-w-none text-sm leading-relaxed text-muted-foreground"
                // Server-authored catalog markup (Business Manager content).
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            )}

            <div className="flex flex-col items-start gap-2 pt-2">
              <Button
                size="lg"
                disabled
                className="font-semibold"
                title="El flujo de carrito llega en la próxima fase"
              >
                Añadir a la bolsa
              </Button>
              <span className="text-xs text-muted-foreground">
                Carrito próximamente — demo en construcción
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
