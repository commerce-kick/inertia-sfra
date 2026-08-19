import { useSfraRequest } from "./sfra";
import type { IProductDetailData } from "@/generated/data";
import { productShowQuickView } from "@/generated/routes/product-showquickview";
import { useQuery } from "@tanstack/react-query";

/** Product-ShowQuickView's payload: the same product the PDP renders, plus its link. */
export type QuickViewResponse = {
  product: IProductDetailData;
  productUrl: string;
};

/** Product-Variation's payload. */
export type VariationResponse = { product: IProductDetailData };

/**
 * The quick look for one product. Disabled until the dialog opens so a grid of
 * tiles costs nothing; the endpoint keeps SFRA's promotion-sensitive cache.
 */
export function useQuickView(pid: string, enabled: boolean) {
  const request = useSfraRequest();

  return useQuery({
    queryKey: ["quick-view", pid],
    enabled,
    staleTime: 60_000,
    queryFn: () => request<QuickViewResponse>(productShowQuickView({ pid })),
  });
}

/**
 * Re-resolve a product against a variation selection without navigating.
 *
 * `variationUrl` is server-authored — each value in the product's
 * variationAttributes carries the one that selects it. The PDP does not use
 * this: there, a selection is a partial visit so it lands in the URL.
 */
export function useVariation(variationUrl: string | null) {
  const request = useSfraRequest();

  return useQuery({
    queryKey: ["product-variation", variationUrl],
    enabled: Boolean(variationUrl),
    staleTime: 60_000,
    queryFn: () => request<VariationResponse>(variationUrl as string),
  });
}
