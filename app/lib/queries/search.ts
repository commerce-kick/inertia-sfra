import { useSfraRequest } from "./sfra";
import type {
  IContentSearchData,
  ISearchSuggestionsData,
} from "@/generated/data";
import { searchContent } from "@/generated/routes/search-content";
import { searchServicesGetSuggestions } from "@/generated/routes/searchservices-getsuggestions";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

/**
 * Base rejects anything shorter than `preferences.minTermLength` (3) and
 * answers with empty groups, so there is no point spending a request on it.
 */
export const MIN_SUGGEST_LENGTH = 3;

/**
 * Header typeahead. The endpoint keeps SFRA's default cache, so results are
 * cheap to re-fetch; react-query holds them briefly so backspacing through a
 * phrase does not re-request what it already has.
 */
export function useSuggestions(phrase: string) {
  const request = useSfraRequest();
  const q = phrase.trim();
  const enabled = q.length >= MIN_SUGGEST_LENGTH;

  return useQuery({
    queryKey: ["search-suggestions", q],
    enabled,
    staleTime: 60_000,
    queryFn: () =>
      request<ISearchSuggestionsData>(searchServicesGetSuggestions({ q })),
  });
}

/**
 * The Articles tab: content assets matching the same phrase as the products.
 *
 * Base fetched this only when the tab was first opened and never again, so
 * `enabled` follows the open tab and the result is held for the visit. Its
 * "More Results" button walked `moreContentUrl` out of the payload and
 * appended a page; the same walk is an infinite query, so pages accumulate.
 *
 * Content search is keyword-only — base hides the whole tab strip on a
 * category listing, where there is no phrase to search content with.
 */
export function useContentSearch(phrase: string, enabled: boolean) {
  const request = useSfraRequest();
  const q = phrase.trim();

  return useInfiniteQuery({
    queryKey: ["content-search", q],
    enabled: enabled && q.length > 0,
    staleTime: 60_000,
    initialPageParam: searchContent({ q, startingPage: 0 }),
    queryFn: ({ pageParam }) => request<IContentSearchData>(pageParam),
    getNextPageParam: (page) => page.moreUrl || undefined,
  });
}
