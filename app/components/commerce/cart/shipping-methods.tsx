import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ICartData } from "@/generated/data";
import { useSelectShippingMethod } from "@/lib/queries/cart";
import { toast } from "sonner";

/**
 * The delivery estimate, and the choice behind it.
 *
 * Base offered every applicable method in a select and posted the choice; the
 * same control here. Until a method is assigned the platform cannot price
 * shipping or tax, which is why those totals read "-" — choosing resolves
 * them, so the whole basket refreshes on the answer.
 */
export function ShippingMethods({ cart }: { cart: ICartData }) {
  const select = useSelectShippingMethod();

  if (!cart.shippingMethods.length) return null;

  return (
    <div className="flex flex-col gap-3 border-t pt-5">
      <label htmlFor="shippingMethod" className="label-caps">
        Delivery
      </label>
      <Select
        value={cart.selectedShippingMethod}
        disabled={select.isPending}
        onValueChange={(methodID) =>
          select.mutate(
            { methodID },
            { onError: (error) => toast.error(error.message) }
          )
        }
      >
        <SelectTrigger id="shippingMethod" className="h-11 w-full">
          <SelectValue placeholder="Choose a delivery method" />
        </SelectTrigger>
        <SelectContent>
          {cart.shippingMethods.map((method) => (
            <SelectItem key={method.id} value={method.id}>
              <span className="flex w-full items-baseline justify-between gap-6">
                <span>
                  {method.displayName}
                  {method.estimatedArrivalTime && (
                    <span className="text-muted-foreground">
                      {" "}
                      · {method.estimatedArrivalTime}
                    </span>
                  )}
                </span>
                <span className="meta-caps text-muted-foreground">
                  {method.shippingCost}
                </span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
