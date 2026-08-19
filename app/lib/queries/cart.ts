import { useSfraRequest } from "./sfra";
import type { IMiniCartData } from "@/generated/data";
import { cartMiniCart } from "@/generated/routes/cart-minicart";
import { useQuery } from "@tanstack/react-query";

/**
 * Every cart query hangs off this key, so one mutation can invalidate the
 * lot without naming them: `queryClient.invalidateQueries({ queryKey: CART_KEY })`.
 */
export const CART_KEY = ["cart"] as const;

/**
 * The bag count in the header.
 *
 * It rides as a query rather than a shared Inertia prop because it changes
 * only when the shopper touches the bag — as a shared prop every page of the
 * storefront would recompute it. Cart mutations invalidate CART_KEY, which
 * is what refreshes it.
 */
export function useMiniCart() {
  const request = useSfraRequest();

  return useQuery({
    queryKey: [...CART_KEY, "count"],
    staleTime: 60_000,
    queryFn: () => request<IMiniCartData>(cartMiniCart()),
  });
}
