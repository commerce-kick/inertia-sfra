import { LineItem } from "./line-item";
import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { cartShow } from "@/generated/routes/cart-show";
import { useMiniCart, useMiniCartContents } from "@/lib/queries/cart";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";

/** Three quiet blocks in the geometry of a line, while the basket loads. */
function FlyoutSkeleton() {
  return (
    <div className="flex flex-col gap-8 px-4">
      {[0, 1, 2].map((row) => (
        <div key={row} className="grid grid-cols-[3.5rem_1fr] gap-4">
          <Skeleton className="aspect-[4/5] w-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * The bag: its count in the header, its contents in a drawer.
 *
 * Base hung the contents off a hover popover and made the glyph itself a
 * link to the cart. Here the glyph opens the drawer and the drawer carries
 * both destinations — the same two affordances, on a control a keyboard and
 * a touch screen can both reach. Contents are only fetched once it opens.
 *
 * The count comes from Cart-MiniCart rather than a shared prop, so it is
 * absent on first paint and settles when the request lands; an empty bag
 * prints no numeral (the mono-ticker rule: figures move because data moved).
 */
export function BagFlyout() {
  const [open, setOpen] = useState(false);
  const { data: mini } = useMiniCart();
  const { data: cart, isPending } = useMiniCartContents(open);
  const quantity = mini?.quantity ?? 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={quantity > 0 ? "w-auto gap-1.5 px-2.5" : undefined}
          aria-label={quantity === 1 ? "Bag, 1 item" : `Bag, ${quantity} items`}
        >
          <ShoppingBag className="size-4" />
          {quantity > 0 && <span className="meta-caps">{quantity}</span>}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle className="display-caps text-2xl">Bag</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-2">
          {isPending && open ? (
            <FlyoutSkeleton />
          ) : cart && cart.items.length > 0 ? (
            <ul className="divide-y px-4">
              {cart.items.map((item) => (
                <li key={item.uuid}>
                  <LineItem
                    item={item}
                    className="grid-cols-[3.5rem_1fr] gap-4 py-6 sm:grid-cols-[3.5rem_1fr] sm:gap-4"
                  >
                    <LineItem.Media />
                    <LineItem.Body>
                      <LineItem.Title />
                      <LineItem.Attributes />
                      <LineItem.Money />
                    </LineItem.Body>
                  </LineItem>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-10 text-sm text-muted-foreground">
              Your bag is empty.
            </p>
          )}
        </div>

        {cart && cart.items.length > 0 && (
          <div className="flex flex-col gap-4 border-t p-4">
            {cart.valid.error && cart.valid.message && (
              <p className="text-sm text-destructive">{cart.valid.message}</p>
            )}
            <div className="flex items-baseline justify-between gap-4">
              <span className="label-caps">Estimated total</span>
              <span className="meta-caps text-base">
                {cart.totals.subTotal}
              </span>
            </div>
            <Button
              asChild={!cart.valid.error}
              size="lg"
              disabled={cart.valid.error}
              className="label-caps h-13 w-full"
            >
              {cart.valid.error ? (
                <span>Checkout</span>
              ) : (
                <a href={cart.checkoutUrl}>Checkout</a>
              )}
            </Button>
            <Link
              href={cartShow()}
              onClick={() => setOpen(false)}
              className="link-draw label-caps w-fit"
            >
              View bag
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
