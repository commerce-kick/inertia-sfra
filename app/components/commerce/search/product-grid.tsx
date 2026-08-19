import {
  ProductTile,
  ProductTileSkeleton,
} from "@/components/commerce/product-tile";
import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import type { ISearchTileData } from "@/generated/data";
import type { ScrollPaginator } from "@/types/shared";
import { InfiniteScroll } from "@inertiajs/react";
import { PackageSearch } from "lucide-react";

function EmptyState({ resetLink }: { resetLink: string }) {
  return (
    <div className="flex flex-col items-center gap-5 py-24 text-center">
      <PackageSearch className="size-8 text-muted-foreground" aria-hidden />
      <h2 className="display-caps text-2xl">No results</h2>
      <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
        Nothing matches this search. Try another word or remove a filter.
      </p>
      <Link
        href={resetLink}
        className="label-caps underline underline-offset-8 transition-opacity hover:opacity-60"
      >
        View the full catalog
      </Link>
    </div>
  );
}

/**
 * The PLP grid. Rows arrive through the scroll paginator, so the grid owns
 * the InfiniteScroll seam, its skeleton loading state, the manual-fetch
 * fallback, and the end-of-list note.
 */
function ProductGrid({
  products,
  resetLink,
  count,
}: {
  products: ScrollPaginator<ISearchTileData>;
  resetLink: string;
  count: number;
}) {
  return (
    <div>
      {products.data.length === 0 ? (
        <EmptyState resetLink={resetLink} />
      ) : (
        <InfiniteScroll
          data="products"
          buffer={400}
          loading={
            <div className="grid grid-cols-2 gap-5 pt-8 sm:grid-cols-3">
              {Array.from({ length: 3 }, (_, i) => (
                <ProductTileSkeleton key={i} />
              ))}
            </div>
          }
          next={({ loading, fetch, manualMode }) =>
            manualMode ? (
              <div className="flex justify-center pt-8">
                <Button
                  variant="outline"
                  onClick={fetch}
                  disabled={loading}
                  className="label-caps h-11 px-8"
                >
                  {loading ? "Loading…" : "Load more items"}
                </Button>
              </div>
            ) : null
          }
        >
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
            {products.data.map((product) => (
              <ProductTile key={product.id} product={product} />
            ))}
          </div>
        </InfiniteScroll>
      )}

      {products.data.length > 0 && products.meta.nextPage === null && (
        <p className="meta-caps border-t pt-6 text-center text-muted-foreground mt-14">
          You have seen all {count} items
        </p>
      )}
    </div>
  );
}

export { ProductGrid };
