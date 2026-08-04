import { InfiniteScroll } from "@inertiajs/react";

// Scroll props now arrive in the Laravel paginator wire shape: the prop is the
// full paginator object and the item array lives under the `data` wrapper key
// (which is also where the client merges new pages — mergeProps: ["products.data"]).
type ScrollPaginator<T> = {
  data: T[];
  meta: {
    pageName: string;
    previousPage: number | null;
    nextPage: number | null;
    currentPage: number | null;
  };
};

export default function SearchShowPage({
  products,
  ...rest
}: {
  products: ScrollPaginator<{ id: string }>;
}) {
  console.log(rest);

  return (
    <InfiniteScroll
      data="products"
      manual
      next={({ loading, fetch, hasMore }) => (
            hasMore && (
                <button onClick={fetch} disabled={loading}>
                    {loading ? 'Loading...' : 'Load more'}
                </button>
            )
        )}
    >
      {products.data.map((p) => {
        return <p key={p.id}>{p.id}</p>;
      })}
    </InfiniteScroll>
  );
}
