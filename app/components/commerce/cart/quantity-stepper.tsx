import { Button } from "@/components/ui/button";
import type { ICartLineItemData } from "@/generated/data";
import { useUpdateQuantity } from "@/lib/queries/cart";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";

/**
 * The quantity control on a cart line.
 *
 * Base offered a pull-down of every allowed quantity; the same bounds drive
 * a stepper here — two square controls either side of the figure, which reads
 * as data because it is. The bounds are the platform's: `minOrderQuantity`
 * from the product and available-to-sell capped by the site's max order
 * quantity, both already on the line.
 *
 * The change is server-owned. Nothing moves optimistically: the figure is
 * whatever the last render said, and the controls rest while the request is
 * in flight.
 */
export function QuantityStepper({ item }: { item: ICartLineItemData }) {
  const update = useUpdateQuantity();

  const set = (quantity: number) =>
    update.mutate(
      { pid: item.id, uuid: item.uuid, quantity },
      { onError: (error) => toast.error(error.message) }
    );

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Decrease quantity of ${item.productName}`}
        disabled={update.isPending || item.quantity <= item.minQuantity}
        onClick={() => set(item.quantity - 1)}
      >
        <Minus className="size-3.5" />
      </Button>
      <span className="meta-caps min-w-6 text-center" aria-live="polite">
        {item.quantity}
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Increase quantity of ${item.productName}`}
        disabled={update.isPending || item.quantity >= item.maxQuantity}
        onClick={() => set(item.quantity + 1)}
      >
        <Plus className="size-3.5" />
      </Button>
    </div>
  );
}
