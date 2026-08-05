import { AppliedFilters } from "@/components/commerce/applied-filters";
import {
  ProductTile,
  ProductTileSkeleton,
} from "@/components/commerce/product-tile";
import { RefinementPanel } from "@/components/commerce/refinement-panel";
import { SortSelect } from "@/components/commerce/sort-select";
import { Link } from "@/components/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { homeShow } from "@/generated/routes/home-show";
import type { SearchShowProps } from "@/types/search";
import { Head, InfiniteScroll, usePage } from "@inertiajs/react";
import { PackageSearch, SlidersHorizontal } from "lucide-react";

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

export default function Show() {
  const page = usePage<SearchShowProps>();
  const { products, search, refinements, selectedFilters, sort } = page.props;

  const title =
    search.category?.pageTitle ||
    search.category?.name ||
    (search.keywords ? `“${search.keywords}”` : "Catalog");
  const hasFilters = selectedFilters.length > 0;

  return (
    <>
      <Head title={`${title} — Meridian`} />

      {/* PAGE HEAD — the collection title at architectural scale */}
      <div className="border-b">
        <div className="container flex flex-col gap-5 pb-8 pt-10">
          <Breadcrumb>
            <BreadcrumbList className="meta-caps">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={homeShow({})}>Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h1 className="display-caps text-[clamp(2.75rem,7vw,6rem)]">
              {title}
            </h1>
            <span className="meta-caps pb-2 text-muted-foreground">
              {search.count} {search.count === 1 ? "item" : "items"}
            </span>
          </div>
        </div>
      </div>

      <div className="container flex flex-col gap-6 py-8">
        {/* TOOLBAR */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="outline" size="sm" className="label-caps">
                  <SlidersHorizontal className="size-4" aria-hidden />
                  Filter
                  {hasFilters && (
                    <Badge className="ml-1 px-1.5 text-[10px]">
                      {selectedFilters.length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="text-left text-base">
                    Filter the catalog
                  </SheetTitle>
                </SheetHeader>
                <div className="px-4 pb-8">
                  <RefinementPanel
                    refinements={refinements}
                    currentUrl={page.url}
                  />
                </div>
              </SheetContent>
            </Sheet>
            <AppliedFilters
              filters={selectedFilters}
              resetLink={search.resetLink}
            />
          </div>
          <SortSelect sort={sort} />
        </div>

        <div className="grid gap-10 lg:grid-cols-[15rem_1fr]">
          {/* REFINEMENT RAIL (desktop) */}
          <aside className="hidden lg:block" aria-label="Filtros">
            <RefinementPanel refinements={refinements} currentUrl={page.url} />
          </aside>

          {/* PRODUCT GRID */}
          <div>
            {products.data.length === 0 ? (
              <EmptyState resetLink={search.resetLink} />
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
                You have seen all {search.count} items
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
