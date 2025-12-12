import { CartMiniCart } from "@/generated/routes";
import { observable } from "@legendapp/state";
import { syncedFetch } from "@legendapp/state/sync-plugins/fetch";

export const cart$ = observable<{ quantity: number }>(
  syncedFetch({
    get: CartMiniCart.url(),
  })
);
