import { useCsrfParams, useSfraRequest } from "./sfra";
import type {
  IBonusOfferData,
  ICartActionData,
  ICartData,
  IMiniCartData,
} from "@/generated/data";
import { cartAddProduct } from "@/generated/routes/cart-addproduct";
import { cartAddBonusProducts } from "@/generated/routes/cart-addbonusproducts";
import { cartAddCoupon } from "@/generated/routes/cart-addcoupon";
import { cartEditBonusProduct } from "@/generated/routes/cart-editbonusproduct";
import { cartEditProductLineItem } from "@/generated/routes/cart-editproductlineitem";
import { cartMiniCart } from "@/generated/routes/cart-minicart";
import { cartMiniCartShow } from "@/generated/routes/cart-minicartshow";
import { cartRemoveCouponLineItem } from "@/generated/routes/cart-removecouponlineitem";
import { cartRemoveProductLineItem } from "@/generated/routes/cart-removeproductlineitem";
import { cartSelectShippingMethod } from "@/generated/routes/cart-selectshippingmethod";
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

/**
 * Change which variant, how many, or which option a line carries.
 *
 * The dialog this belongs to arrives with Cart-GetProduct, which is what
 * supplies the product to edit.
 */
export function useEditLineItem() {
  const request = useSfraRequest();
  const refresh = useCartRefresh();

  return useMutation({
    mutationFn: (vars: {
      uuid: string;
      pid: string;
      quantity: number;
      selectedOptionValueId?: string;
    }) => {
      const body: Record<string, string | number> = {
        uuid: vars.uuid,
        pid: vars.pid,
        quantity: vars.quantity,
      };
      if (vars.selectedOptionValueId) {
        body.selectedOptionValueId = vars.selectedOptionValueId;
      }

      return request<ICartData>(cartEditProductLineItem(), body);
    },
    onSuccess: refresh,
  });
}

/**
 * Redeem a promo code.
 *
 * Base guarded the route with `csrfProtection.validateAjaxRequest` and left
 * it a GET, so the token rides in the query string beside the code.
 */
export function useAddCoupon() {
  const request = useSfraRequest();
  const csrf = useCsrfParams();
  const refresh = useCartRefresh();

  return useMutation({
    mutationFn: (vars: { couponCode: string }) =>
      request<ICartData>(cartAddCoupon({ ...vars, ...csrf })),
    onSuccess: refresh,
  });
}

/** Give a promo code back. The UUID identifies the line; the code names it. */
export function useRemoveCoupon() {
  const request = useSfraRequest();
  const refresh = useCartRefresh();

  return useMutation({
    mutationFn: (vars: { uuid: string; code: string }) =>
      request<ICartData>(cartRemoveCouponLineItem(vars)),
    onSuccess: refresh,
  });
}

/** One pick in a choice-of-bonus selection. */
export type BonusPick = { pid: string; qty: number };

/**
 * Commit a choice-of-bonus selection.
 *
 * Base declares the route a POST but reads its three fields off the query
 * string, so that is where they go. `totalQty` is what the promotion allows,
 * not what was picked — base validates the picks against it.
 */
export function useAddBonusProducts() {
  const request = useSfraRequest();
  const refresh = useCartRefresh();

  return useMutation({
    mutationFn: (vars: {
      uuid: string;
      pliUuid: string;
      maxPids: number;
      picks: BonusPick[];
    }) =>
      request<ICartActionData>(
        cartAddBonusProducts({
          uuid: vars.uuid,
          pliuuid: vars.pliUuid,
          pids: JSON.stringify({
            totalQty: vars.maxPids,
            bonusProducts: vars.picks.map((pick) => ({
              pid: pick.pid,
              qty: pick.qty,
              options: [],
            })),
          }),
        })
      ),
    onSuccess: refresh,
  });
}

/**
 * Reopen a choice-of-bonus offer already in the bag.
 *
 * It answers the same offer Cart-AddProduct hands back, so the same chooser
 * opens on it. A query rather than a mutation: it changes nothing, and a
 * shopper who reopens the same offer twice should not pay for it twice.
 */
export function useEditBonusProduct(duuid: string | null) {
  const request = useSfraRequest();

  return useQuery({
    queryKey: [...CART_KEY, "bonus-offer", duuid],
    enabled: Boolean(duuid),
    queryFn: () =>
      request<IBonusOfferData>(cartEditBonusProduct({ duuid: duuid as string })),
  });
}

/**
 * Choose how the bag should be delivered.
 *
 * The shipment is left unnamed: base falls back to the basket's default, and
 * the cart is single-shipment — splitting a basket across shipments is
 * checkout's job.
 */
export function useSelectShippingMethod() {
  const request = useSfraRequest();
  const refresh = useCartRefresh();

  return useMutation({
    mutationFn: (vars: { methodID: string }) =>
      request<ICartData>(cartSelectShippingMethod(), vars),
    onSuccess: refresh,
  });
}
