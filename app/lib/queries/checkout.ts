import { useSfraRequest } from "./sfra";
import { CART_KEY } from "./cart";
import type { ICheckoutResultData, IPlacedOrderData } from "@/generated/data";
import { checkoutServicesGet } from "@/generated/routes/checkoutservices-get";
import { checkoutServicesLoginCustomer } from "@/generated/routes/checkoutservices-logincustomer";
import { checkoutServicesPlaceOrder } from "@/generated/routes/checkoutservices-placeorder";
import { checkoutServicesSubmitCustomer } from "@/generated/routes/checkoutservices-submitcustomer";
import { checkoutServicesSubmitPayment } from "@/generated/routes/checkoutservices-submitpayment";
import { checkoutShippingServicesSelectShippingMethod } from "@/generated/routes/checkoutshippingservices-selectshippingmethod";
import { checkoutShippingServicesSubmitShipping } from "@/generated/routes/checkoutshippingservices-submitshipping";
import { checkoutShippingServicesUpdateShippingMethodsList } from "@/generated/routes/checkoutshippingservices-updateshippingmethodslist";
import { router } from "@inertiajs/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** Every checkout query hangs off this key. */
export const CHECKOUT_KEY = ["checkout"] as const;

/**
 * Re-read the basket as checkout sees it.
 *
 * Base built CheckoutServices-Get for its multi-ship flow; typed, it is
 * simply the "what does the order look like now" call — useful when a stage
 * needs the current totals without having changed anything itself.
 */
export function useCheckout(enabled = true) {
  const request = useSfraRequest();

  return useQuery({
    queryKey: CHECKOUT_KEY,
    enabled,
    queryFn: () => request<ICheckoutResultData>(checkoutServicesGet()),
  });
}

/**
 * Every checkout mutation answers the same thing — the re-rendered order —
 * so they share one shape: the values go up keyed by the server's own field
 * names, the answer comes back with `order` (the totals as they now stand)
 * and `fields` (anything refused, per field).
 *
 * The basket queries are invalidated alongside, since the header's bag count
 * is reading the same basket this is changing.
 */
function useCheckoutMutation(url: string) {
  const request = useSfraRequest();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fields: Record<string, string>) =>
      request<ICheckoutResultData>(url, fields),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: CART_KEY });
      queryClient.setQueryData(CHECKOUT_KEY, result);
      if (result.redirectUrl) router.visit(result.redirectUrl);
    },
  });
}

/** The guest's email — the first stage's only question. */
export function useSubmitCustomer() {
  return useCheckoutMutation(checkoutServicesSubmitCustomer({}));
}

/**
 * Sign in from the checkout gate. Base re-issues the CSRF token here because
 * the session transforms on login; the port's token is an `always()` shared
 * prop, so the visit that follows base's redirect carries a fresh one.
 */
export function useCheckoutLogin() {
  return useCheckoutMutation(checkoutServicesLoginCustomer({}));
}

/** The shipping address and method, submitted together as base submits them. */
export function useSubmitShipping() {
  return useCheckoutMutation(checkoutShippingServicesSubmitShipping({}));
}

/** Change the shipping method, which moves the shipping and tax totals. */
export function useSelectCheckoutShipping() {
  return useCheckoutMutation(checkoutShippingServicesSelectShippingMethod({}));
}

/**
 * Ask what can ship to an address. Only the server knows, so this is called
 * as the address takes shape rather than guessed at from a postcode.
 */
export function useShippingMethods() {
  return useCheckoutMutation(
    checkoutShippingServicesUpdateShippingMethodsList({})
  );
}

/** The billing address and the card. */
export function useSubmitPayment() {
  return useCheckoutMutation(checkoutServicesSubmitPayment({}));
}

/**
 * Place the order.
 *
 * The one checkout call that does not answer with a basket, because after it
 * there is no basket: it answers the order that now exists. Everything that
 * can refuse it — an unavailable product, an invalid address, a declined card
 * — arrives as a rejection carrying base's own message.
 */
export function usePlaceOrder() {
  const request = useSfraRequest();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      request<IPlacedOrderData>(checkoutServicesPlaceOrder({}), {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEY });
      queryClient.removeQueries({ queryKey: CHECKOUT_KEY });
    },
  });
}
