import type { ICartData } from "@/generated/data";

/**
 * The delivery estimate. Base offered every applicable method in a <select>
 * and posted the choice to Cart-SelectShippingMethod; until that row lands
 * the current method is shown as what it is — data the platform already
 * chose (ensureAllShipmentsHaveMethods runs before the cart renders).
 */
export function ShippingMethods({ cart }: { cart: ICartData }) {
  const selected = cart.shippingMethods.find(
    (method) => method.id === cart.selectedShippingMethod
  );
  if (!selected) return null;

  return (
    <div className="flex flex-col gap-3 border-t pt-5">
      <h2 className="label-caps">Delivery</h2>
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm">{selected.displayName}</span>
        <span className="meta-caps">{selected.shippingCost}</span>
      </div>
      {selected.estimatedArrivalTime && (
        <span className="meta-caps text-muted-foreground">
          {selected.estimatedArrivalTime}
        </span>
      )}
    </div>
  );
}
