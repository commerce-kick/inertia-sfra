import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useContentSearch } from "@/lib/queries/search";
import { FileText } from "lucide-react";

/** The result-count line base showed above the first page of articles. */
function ResultsMessage({ count, phrase }: { count: number; phrase: string }) {
  return (
    <p className="meta-caps text-muted-foreground">
      {count === 0 ? "No articles found for" : `${count} articles for`}{" "}
      <span className="text-foreground">“{phrase}”</span>
    </p>
  );
}

/**
 * The Articles tab: content assets matching the search phrase.
 *
 * Base fetched this lazily the first time the tab was clicked and paged it
 * with a "More Results" button; both are kept, with the fetch gated on the
 * tab being open. Base also dropped a `noresults-help` Page Designer slot
 * under an empty result — slots have no React surface yet, so that is left
 * out (see the row's Notes).
 */
function ContentResults({ phrase, active }: { phrase: string; active: boolean }) {
  const { data, isPending, isError, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useContentSearch(phrase, active);

  const pages = data?.pages ?? [];
  const results = pages.flatMap((page) => page.contents);
  const count = pages[0]?.contentCount ?? 0;

  if (isPending) {
    return (
      <div className="flex flex-col gap-6 py-8">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex flex-col gap-2 border-b pb-6">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="py-8 text-sm leading-relaxed text-muted-foreground">
        These articles could not be loaded. Try the search again.
      </p>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center gap-5 py-24 text-center">
        <FileText className="size-8 text-muted-foreground" aria-hidden />
        <h2 className="display-caps text-2xl">No articles</h2>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          Nothing written matches “{phrase}”. The products tab may still have
          something.
        </p>
      </div>
    );
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6 py-8">
      {pages[0]?.hasMessage && (
        <ResultsMessage count={count} phrase={pages[0].queryPhrase || phrase} />
      )}

      <ul className="flex flex-col">
        {results.map((result, i) => (
          <li key={`${result.url}-${i}`} className="border-b last:border-b-0">
            <Link href={result.url} className="flex flex-col gap-2 py-6">
              <h3 className="display-caps text-xl">
                <span className="link-draw">{result.name}</span>
              </h3>
              {result.description && (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {result.description}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>

      {hasNextPage && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="label-caps h-11 px-8"
          >
            {isFetchingNextPage ? "Loading…" : "More results"}
          </Button>
        </div>
      )}
    </div>
  );
}

export { ContentResults };
