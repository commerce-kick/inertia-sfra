import { ProductBreadcrumbs } from "@/components/commerce/product/product-breadcrumbs";
import { ProductGallery } from "@/components/commerce/product/product-gallery";
import { ProductSummary } from "@/components/commerce/product/product-summary";
import type { ProductShowProps } from "@/types/product";
import { Head, usePage } from "@inertiajs/react";

export default function Show() {
  const { product, breadcrumbs } = usePage<ProductShowProps>().props;
  // Deepest category crumb — PDP breadcrumbs carry the category path.
  const categoryCrumb = [...breadcrumbs].reverse().find((crumb) => crumb.url);

  return (
    <>
      <Head title={`${product.productName} — Meridian`} />

      <div className="container flex flex-col gap-8 py-8 pb-20">
        <ProductBreadcrumbs crumbs={breadcrumbs} />

        <div className="grid gap-10 lg:grid-cols-2">
          <ProductGallery product={product} />
          <ProductSummary product={product} categoryCrumb={categoryCrumb} />
        </div>
      </div>
    </>
  );
}
