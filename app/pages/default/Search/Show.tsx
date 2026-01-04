import { InfiniteScroll } from "@inertiajs/react";

export default function SearchShowPage({
  products,
  ...rest
}: {
  products: unknown[];
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
      {products.map((p) => {
        return <p key={p.id}>{p.id}</p>;
      })}
    </InfiniteScroll>
  );
}
