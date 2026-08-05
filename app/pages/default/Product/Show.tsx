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
    <div className="flex items-baseline gap-3">
      <span className="font-mono text-xl tracking-[0.04em]">
        {price.isRange && price.min && price.max
          ? `${price.min.formatted}–${price.max.formatted}`
          : price.sales?.formatted}
      </span>
      {price.list && (
        <s className="font-mono text-sm text-muted-foreground">
          {price.list.formatted}
        </s>
      )}
    </div>
  );
}

function Gallery({ product }: { product: IProductDetailData }) {
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

export default function Show() {
  const { product, breadcrumbs } = usePage<ProductShowProps>().props;
  // Deepest category crumb — PDP breadcrumbs carry the category path.
  const categoryCrumb = [...breadcrumbs].reverse().find((crumb) => crumb.url);

  return (
    <>
      <Head title={`${product.productName} — Meridian`} />

      <div className="container flex flex-col gap-8 py-8 pb-20">
        <Breadcrumb>
          <BreadcrumbList className="meta-caps">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={homeShow({})}>Home</Link>
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

          <div className="flex max-w-xl flex-col items-start gap-6 lg:sticky lg:top-24 lg:self-start">
            <div className="flex flex-col gap-3">
              <h1 className="display-caps text-3xl sm:text-4xl">
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
              <div key={attr.id} className="flex flex-col gap-2.5">
                <span className="label-caps text-muted-foreground">
                  {attr.displayName || attr.id}
                </span>
                <div className="flex flex-wrap gap-2">
                  {attr.values.map((value) =>
                    attr.swatchable && value.image ? (
                      <span
                        key={value.id}
                        title={value.displayValue}
                        className={`size-10 overflow-hidden border p-0.5 ${
                          value.selected
                            ? "border-foreground"
                            : "border-transparent"
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
                        className="label-caps px-3 py-1.5"
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
                className={`size-2 ${
                  product.availability.available
                    ? "bg-foreground"
                    : "bg-destructive"
                }`}
                aria-hidden
              />
              <span className="text-sm text-muted-foreground">
                {product.availability.available
                  ? "In stock"
                  : product.availability.messages[0] || "Unavailable"}
              </span>
            </div>

            <div className="flex w-full flex-col items-start gap-2.5 pt-2">
              <Button
                size="lg"
                disabled
                className="label-caps h-13 w-full max-w-sm"
                title="The cart flow arrives in the next phase"
              >
                Add to bag
              </Button>
              <span className="meta-caps text-muted-foreground">
                Cart coming soon · demo in progress
              </span>
            </div>

            {product.description && (
              <div className="flex w-full flex-col gap-3 border-t pt-6">
                <h2 className="label-caps">Description</h2>
                <div
                  className="max-w-none text-sm leading-relaxed text-muted-foreground"
                  // Server-authored catalog markup (Business Manager content).
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            )}

            <div className="flex w-full flex-col gap-3 border-t pt-6">
              <h2 className="label-caps">Details</h2>
              <dl className="w-full text-sm">
                <div className="flex items-center justify-between gap-4 border-b py-2.5 last:border-b-0">
                  <dt className="label-caps text-muted-foreground">Reference</dt>
                  <dd className="meta-caps">{product.id}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 border-b py-2.5 last:border-b-0">
                  <dt className="label-caps text-muted-foreground">Availability</dt>
                  <dd>
                    {product.availability.available
                      ? "In stock"
                      : "Unavailable"}
                  </dd>
                </div>
                {categoryCrumb && (
                  <div className="flex items-center justify-between gap-4 border-b py-2.5 last:border-b-0">
                    <dt className="label-caps text-muted-foreground">Category</dt>
                    <dd>
                      {categoryCrumb.url ? (
                        <Link
                          href={categoryCrumb.url}
                          className="text-link underline-offset-4 hover:underline"
                        >
                          {categoryCrumb.htmlValue}
                        </Link>
                      ) : (
                        categoryCrumb.htmlValue
                      )}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
