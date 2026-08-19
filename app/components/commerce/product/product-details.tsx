import { Link } from "@/components/link";
import type { IProductDetailData } from "@/generated/data";
import type { Crumb } from "@/types/product";

/** The spec table: reference, availability, and the deepest linked category. */
function ProductDetails({
  product,
  categoryCrumb,
}: {
  product: IProductDetailData;
  categoryCrumb?: Crumb;
}) {
  return (
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
  );
}

export { ProductDetails };
