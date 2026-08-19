import { useSfraRequest } from "./sfra";
import type { ICartData, IMiniCartData } from "@/generated/data";
import { cartMiniCart } from "@/generated/routes/cart-minicart";
import { cartMiniCartShow } from "@/generated/routes/cart-minicartshow";
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

/**
 * The contents of the bag flyout — the same basket the cart page renders.
 *
 * Base fetched the fragment every time the popover opened; this is the same
 * shape as a query disabled until the flyout is open, so a shopper who never
 * opens it never pays for it.
 */
export function useMiniCartContents(enabled: boolean) {
  const request = useSfraRequest();

  return useQuery({
    queryKey: [...CART_KEY, "contents"],
    enabled,
    staleTime: 60_000,
    queryFn: () => request<ICartData>(cartMiniCartShow()),
  });
}
