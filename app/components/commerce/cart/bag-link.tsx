import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import { cartShow } from "@/generated/routes/cart-show";
import { useMiniCart } from "@/lib/queries/cart";
import { ShoppingBag } from "lucide-react";

/**
 * The header's bag: the link to the cart and the count of what is in it.
 *
 * The count arrives from Cart-MiniCart rather than as a shared prop, so it
 * is absent on first paint and settles when the request lands — which is
 * also the only time it may move (the mono-ticker rule: numerals move
 * because the data moved). Nothing is reserved for it while it is unknown;
 * an empty bag prints nothing, exactly as a zero would read as noise.
 */
export function BagLink() {
  const { data } = useMiniCart();
  const quantity = data?.quantity ?? 0;

  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className={quantity > 0 ? "w-auto gap-1.5 px-2.5" : undefined}
    >
      <Link
        href={cartShow()}
        aria-label={
          quantity === 1 ? "Bag, 1 item" : `Bag, ${quantity} items`
        }
      >
        <ShoppingBag className="size-4" />
        {quantity > 0 && <span className="meta-caps">{quantity}</span>}
      </Link>
    </Button>
  );
}
