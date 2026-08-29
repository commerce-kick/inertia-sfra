import { RefinementPanel } from "@/components/commerce/refinement-panel";
import { ContentResults } from "@/components/commerce/search/content-results";
import { ProductGrid } from "@/components/commerce/search/product-grid";
import { SearchHeader } from "@/components/commerce/search/search-header";
import { SearchToolbar } from "@/components/commerce/search/search-toolbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SearchShowProps } from "@/types/search";
import { Head, usePage } from "@inertiajs/react";
import { useState } from "react";

export default function Show() {
  const page = usePage<SearchShowProps>();
  const { products, search, refinements, selectedFilters, sort } = page.props;
  const [tab, setTab] = useState("products");

  const title =
    search.category?.pageTitle ||
    search.category?.name ||
    (search.keywords ? `“${search.keywords}”` : "Catalog");

  // Base showed the Products/Articles tabs only on a keyword search: a
  // category listing has no phrase to search content with.
  const hasArticles = !search.isCategorySearch && Boolean(search.keywords);

  const productPane = (
    <div className="flex flex-col gap-6">
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
  );

  return (
    <>
      <Head title={`${title} — Meridian`} />

      <SearchHeader title={title} count={search.count} />

      <div className="container flex flex-col gap-6 py-8">
        {hasArticles ? (
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList variant="line" className="w-full justify-start border-b">
              <TabsTrigger value="products" className="label-caps flex-none px-4">
                Products
              </TabsTrigger>
              <TabsTrigger value="articles" className="label-caps flex-none px-4">
                Articles
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products">{productPane}</TabsContent>
            <TabsContent value="articles">
              <ContentResults
                phrase={search.keywords}
                active={tab === "articles"}
              />
            </TabsContent>
          </Tabs>
        ) : (
          productPane
        )}
      </div>
    </>
  );
}
