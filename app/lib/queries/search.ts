import { useSfraRequest } from "./sfra";
import type { ISearchSuggestionsData } from "@/generated/data";
import { searchServicesGetSuggestions } from "@/generated/routes/searchservices-getsuggestions";
import { useQuery } from "@tanstack/react-query";

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
