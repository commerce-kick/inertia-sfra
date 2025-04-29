import { Cart_MiniCart } from "@/generated/routes";
import { observable } from "@legendapp/state";
import { syncedFetch } from "@legendapp/state/sync-plugins/fetch";
import { getUrl } from "@/generated/routes/_helpers";

const route = getUrl(Cart_MiniCart);

export const cart$ = observable<{ quantity: number }>(
  syncedFetch({
    get: route,
  })
);
