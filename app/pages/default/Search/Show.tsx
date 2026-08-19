import { RefinementPanel } from "@/components/commerce/refinement-panel";
import { ProductGrid } from "@/components/commerce/search/product-grid";
import { SearchHeader } from "@/components/commerce/search/search-header";
import { SearchToolbar } from "@/components/commerce/search/search-toolbar";
import type { SearchShowProps } from "@/types/search";
import { Head, usePage } from "@inertiajs/react";

export default function Show() {
  const page = usePage<SearchShowProps>();
  const { products, search, refinements, selectedFilters, sort } = page.props;

  const title =
    search.category?.pageTitle ||
    search.category?.name ||
    (search.keywords ? `“${search.keywords}”` : "Catalog");

  return (
    <>
      <Head title={`${title} — Meridian`} />

      <SearchHeader title={title} count={search.count} />

      <div className="container flex flex-col gap-6 py-8">
        <SearchToolbar
          refinements={refinements}
          selectedFilters={selectedFilters}
          resetLink={search.resetLink}
          sort={sort}
          currentUrl={page.url}
        />

        <div className="grid gap-10 lg:grid-cols-[15rem_1fr]">
          {/* REFINEMENT RAIL (desktop) */}
          <aside className="hidden lg:block" aria-label="Filters">
            <RefinementPanel refinements={refinements} currentUrl={page.url} />
          </aside>

          <ProductGrid
            products={products}
            resetLink={search.resetLink}
            count={search.count}
          />
        </div>
      </div>
    </>
  );
}
