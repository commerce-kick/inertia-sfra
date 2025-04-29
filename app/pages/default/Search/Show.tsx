import { useCallback, useMemo, useState } from "react";
import { Head, Link, router, usePrefetch } from "@inertiajs/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { Filter } from "lucide-react";

import { ProductsGridSkeleton } from "@/components/commerce/product-skeleton";
import ProductTile from "@/components/commerce/product-tile";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Layout from "@/layouts/default";
import { queryData, searchParams } from "@/lib/commerce";
import {
  createRouteHelpers,
  getUrl,
  Search_Show,
  Search_ShowAjax,
  Search_UpdateGrid,
} from "@/generated/routes";
import { cn } from "@/lib/utils";

const MoreProducts = ({
  showMore,
  queryString,
}: {
  queryString: string;
  showMore?: string;
}) => {
  const initialParams = useMemo(() => {
    return queryData(queryString);
  }, [queryString]);

  //@ts-ignore
  const { data, fetchNextPage, isLoading, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["showMore", { queryString }],
      queryFn: async ({ pageParam }: any) => {
        const { data } = await axios.get(getUrl(Search_UpdateGrid), {
          params: pageParam,
        });
        return data;
      },
      initialPageParam: initialParams,
      getNextPageParam: ({ showMore }) => {
        return !showMore ? undefined : searchParams(showMore).data;
      },
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      select: (data) => data.pages.flatMap((page) => page.products || []),
    });

  if (isLoading) {
    return <ProductsGridSkeleton />;
  }

  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {data?.map((result) => {
        return <ProductTile key={result.id} {...result.product} />;
      })}
      {showMore && (
        <div className="col-span-full grid grid-cols-1">
          <Button
            disabled={isFetchingNextPage}
            onClick={() => {
              fetchNextPage();
            }}
          >
            {isFetchingNextPage ? "loading..." : "View More"}
          </Button>
        </div>
      )}
    </div>
  );
};

const FiltersContent = ({
  refinements,
  productSort,
  cgid,
  handleSelectedRinament,
  handleOnSortChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Select
          defaultValue={productSort.ruleId}
          onValueChange={handleOnSortChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={productSort.ruleId} />
          </SelectTrigger>
          <SelectContent>
            {productSort.options.map((sort) => {
              return (
                <SelectItem key={sort.id} value={sort.id}>
                  {sort.displayName}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <Button variant="outline" className="w-full" asChild>
        <Link href={"Search-Show"} data={{ cgid }}>
          Reset
        </Link>
      </Button>

      {refinements.map((refinament, index) => {
        return (
          <div className="border-t pt-4" key={`serach-${index}`}>
            <h3 className="mb-2 font-medium">{refinament.displayName}</h3>
            <div className="space-y-2">
              {refinament.values.map((val, i) => {
                return (
                  <div
                    className="flex items-center gap-2"
                    data-url={val.url}
                    key={`ref-${i}`}
                  >
                    <Checkbox
                      id={`${val.presentationId}-${index}`}
                      checked={val.selected}
                      disabled={!val.selectable}
                      onCheckedChange={() => {
                        handleSelectedRinament(val.url);
                      }}
                    />
                    <label
                      htmlFor={`${val.presentationId}-${index}`}
                      className={cn(
                        "text-sm",
                        !val.selectable && "line-through"
                      )}
                    >
                      {val.displayValue}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const SearchShow = ({
  refinements,
  productSort,
  count,
  showMore,
  cgid,
  query,
  resetLink,
}: {
  refinements: any[];
  productSort: any;
  count: number;
  cgid: string;
  showMore?: string;
  query: string;
  resetLink: string;
}) => {
  const [open, setOpen] = useState(false);

  const routes = createRouteHelpers({
    "Search-Show": Search_Show,
  });

  const handleSelectedRinament = useCallback(async (url: string) => {
    const { data } = searchParams(url);

    router.visit(routes.url("Search-Show"), {
      data,
      preserveScroll: true,
    });

    setOpen(false);
  }, []);

  const handleOnSortChange = useCallback(
    (sortId: string) => {
      const rule = productSort.options.find((sort) => sort.id === sortId);

      router.reload({
        data: Object.fromEntries(new URLSearchParams(rule.url)),
      });
    },
    [productSort.options]
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-medium">{count} Results</h1>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="md:hidden">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[350px] p-4">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <FiltersContent
              refinements={refinements}
              productSort={productSort}
              cgid={cgid}
              handleSelectedRinament={handleSelectedRinament}
              handleOnSortChange={handleOnSortChange}
            />
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        {/* Desktop Filters - Hidden on Mobile */}
        <div className="hidden md:block space-y-6">
          <FiltersContent
            refinements={refinements}
            productSort={productSort}
            cgid={cgid}
            handleSelectedRinament={handleSelectedRinament}
            handleOnSortChange={handleOnSortChange}
          />
        </div>

        {/* Products Grid - Full width on mobile, 3/4 on desktop */}
        <div className="md:col-span-3">
          <MoreProducts queryString={query} showMore={showMore} />
        </div>
      </div>
    </div>
  );
};

//@ts-ignore
SearchShow.layout = (page) => <Layout>{page}</Layout>;

export default SearchShow;
