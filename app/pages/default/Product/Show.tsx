import { Barcode } from "@/components/commerce/barcode";
import { HangTag } from "@/components/commerce/hang-tag";
import { Ticket } from "@/components/commerce/ticket";
import { Link } from "@/components/link";
import { AspectRatio } from "@/components/ui/aspect-ratio";
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
import { Star } from "lucide-react";
import { Fragment, useState } from "react";

function PdpPrice({ price }: { price: IProductDetailData["price"] }) {
  if (!price) return null;
  return (
    <HangTag tilt={-3} className="text-lg">
      <span className="inline-flex items-baseline gap-2 py-0.5">
        <span className="font-mono font-semibold">
          {price.isRange && price.min && price.max
            ? `${price.min.formatted}–${price.max.formatted}`
            : price.sales?.formatted}
        </span>
        {price.list && (
          <s className="font-mono text-sm text-muted-foreground decoration-primary decoration-2">
            {price.list.formatted}
          </s>
        )}
      </span>
    </HangTag>
  );
}

function Gallery({ product }: { product: IProductDetailData }) {
  const [active, setActive] = useState(0);
  const image = product.images[active] ?? product.images[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-card shadow-xs">
        <AspectRatio ratio={1}>
          {image ? (
            <img
              src={image.url}
              alt={image.alt || product.productName}
              className="size-full object-contain p-10"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <span className="ticket-caps text-muted-foreground">Sin foto</span>
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
              className={`size-16 bg-card p-2 shadow-xs transition-shadow ${
                i === active ? "ring-2 ring-ring" : "hover:shadow-sm"
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
          <BreadcrumbList className="font-mono text-[11px] uppercase tracking-widest">
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
            <div className="flex flex-col gap-3">
              <h1 className="stamp-display text-3xl leading-none sm:text-4xl">
                {product.productName}
              </h1>
              <div className="flex items-center gap-3">
                <Barcode value={product.id} className="w-24 text-foreground/40" />
                {product.rating > 0 && (
                  <span className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground">
                    <Star className="size-3.5 fill-current text-secondary-foreground/70" />
                    {product.rating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>

            <PdpPrice price={product.price} />

            {product.variationAttributes.map((attr) => (
              <div key={attr.id} className="flex flex-col gap-2">
                <span className="ticket-caps text-xs text-muted-foreground">
                  {attr.displayName || attr.id}
                </span>
                <div className="flex flex-wrap gap-2">
                  {attr.values.map((value) =>
                    attr.swatchable && value.image ? (
                      <span
                        key={value.id}
                        title={value.displayValue}
                        className={`size-8 overflow-hidden rounded-full border ${
                          value.selected ? "ring-2 ring-ring" : "border-border"
                        }`}
                      >
                        <img
                          src={value.image.url}
                          alt={value.displayValue}
                          className="size-full object-cover"
                        />
                      </span>
                    ) : (
                      <Ticket
                        key={value.id}
                        className={value.selected ? "ring-1 ring-ring" : ""}
                      >
                        {value.displayValue}
                      </Ticket>
                    )
                  )}
                </div>
              </div>
            ))}

            <div className="flex items-center gap-3">
              <span
                className={`size-2 rounded-full ${
                  product.availability.available ? "bg-chart-3" : "bg-destructive"
                }`}
                aria-hidden
              />
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {product.availability.available
                  ? "En el taller, listo para envolver"
                  : product.availability.messages[0] || "No disponible"}
              </span>
            </div>

            {product.description && (
              <div
                className="prose prose-sm max-w-none text-sm leading-relaxed text-muted-foreground"
                // Server-authored catalog markup (Business Manager content).
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            )}

            <div className="flex flex-col items-start gap-2 pt-2">
              <Button
                disabled
                className="ticket-caps rounded-none text-xs"
                title="El flujo de carrito llega en la próxima fase"
              >
                Añadir a la bolsa
              </Button>
              <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                Carrito próximamente — demo en construcción
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
