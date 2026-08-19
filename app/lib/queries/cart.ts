import { useSfraRequest } from "./sfra";
import type {
  ICartActionData,
  ICartData,
  IMiniCartData,
} from "@/generated/data";
import { cartAddProduct } from "@/generated/routes/cart-addproduct";
import { cartMiniCart } from "@/generated/routes/cart-minicart";
import { cartMiniCartShow } from "@/generated/routes/cart-minicartshow";
import { cartRemoveProductLineItem } from "@/generated/routes/cart-removeproductlineitem";
import { cartUpdateQuantity } from "@/generated/routes/cart-updatequantity";
import { router, usePage } from "@inertiajs/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

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

/**
 * What every cart mutation does once it lands: drop the cached bag queries,
 * and — only on a page that actually renders the basket — partially reload
 * the `cart` prop it just invalidated. A PDP has no `cart` prop, so asking
 * for one there would be a round trip for nothing.
 */
export function useCartRefresh() {
  const queryClient = useQueryClient();
  const rendersCart = Boolean(usePage().props.cart);

  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: CART_KEY });
    if (rendersCart) router.reload({ only: ["cart"] });
  }, [queryClient, rendersCart]);
}

/** The fields Cart-AddProduct accepts. Absent ones are never sent. */
export type AddToCartVars = {
  pid: string;
  quantity?: number;
  /** JSON array of `{optionId, selectedValueId}` — base parses it server-side. */
  options?: string;
  /** JSON array of bundle children. */
  childProducts?: string;
  /** JSON array of `{pid, qty, options}`, for a product set. */
  pidsObj?: string;
};

/**
 * Add a product to the bag.
 *
 * Quantity and options are server-owned on the product surfaces — both are
 * resolved by the URL the shopper is on — so callers pass back what the
 * product model already reports rather than holding a second copy in state.
 */
export function useAddToCart() {
  const request = useSfraRequest();
  const refresh = useCartRefresh();

  return useMutation({
    mutationFn: (vars: AddToCartVars) => {
      const body: Record<string, string | number> = { pid: vars.pid };
      if (vars.quantity !== undefined) body.quantity = vars.quantity;
      if (vars.options) body.options = vars.options;
      if (vars.childProducts) body.childProducts = vars.childProducts;
      if (vars.pidsObj) body.pidsObj = vars.pidsObj;

      return request<ICartActionData>(cartAddProduct(), body);
    },
    onSuccess: refresh,
  });
}

/**
 * Change how many of a line the shopper wants.
 *
 * The answer is the whole basket, but nothing reads it: the cart page reloads
 * its own prop, which is the copy on screen. What the mutation is really for
 * is the change itself.
 */
export function useUpdateQuantity() {
  const request = useSfraRequest();
  const refresh = useCartRefresh();

  return useMutation({
    mutationFn: (vars: { pid: string; uuid: string; quantity: number }) =>
      request<ICartData>(cartUpdateQuantity(vars)),
    onSuccess: refresh,
  });
}

/** Take a line out of the bag. */
export function useRemoveLineItem() {
  const request = useSfraRequest();
  const refresh = useCartRefresh();

  return useMutation({
    mutationFn: (vars: { pid: string; uuid: string }) =>
      request<ICartData>(cartRemoveProductLineItem(vars)),
    onSuccess: refresh,
  });
}
