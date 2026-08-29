import { Link } from "@/components/link";
import { checkoutBegin } from "@/generated/routes/checkout-begin";
import { Button } from "@/components/ui/button";
import type { ICartData } from "@/generated/data";
import { cn } from "@/lib/utils";

/** One totals row: caps label on the left, mono figure on the right. */
function Row({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-6">
      <dt className={cn("label-caps", !emphasis && "text-muted-foreground")}>
        {label}
      </dt>
      <dd className={cn("meta-caps", emphasis && "text-base")}>{value}</dd>
    </div>
  );
}

/**
 * The money rail. Every figure arrives formatted by the platform, including
 * the "-" base prints for anything it cannot compute until a shipping method
 * and a tax jurisdiction exist. The two discount rows appear only when they
 * discount something, exactly as base hid them on a zero value.
 *
 * Checkout is barred while the basket validation hook reports an error —
 * base disabled the same button on the same flag.
 */
export function CartSummary({
  cart,
  children,
}: {
  cart: ICartData;
  children?: React.ReactNode;
}) {
  const { totals, valid } = cart;

  return (
    <aside className="flex flex-col gap-8 lg:sticky lg:top-24 lg:self-start">
      {children}

      <div className="flex flex-col gap-5 border-t pt-5">
        <h2 className="label-caps">Summary</h2>
        <dl className="flex flex-col gap-3">
          <Row label="Subtotal" value={totals.subTotal} />
          <Row label="Shipping" value={totals.totalShippingCost} />
          {totals.shippingDiscount.value > 0 && (
            <Row
              label="Shipping discount"
              value={`− ${totals.shippingDiscount.formatted}`}
            />
          )}
          <Row label="Tax" value={totals.totalTax} />
          {totals.orderDiscount.value > 0 && (
            <Row
              label="Order discount"
              value={`− ${totals.orderDiscount.formatted}`}
            />
          )}
        </dl>
        <div className="border-t pt-4">
          <dl>
            <Row label="Estimated total" value={totals.grandTotal} emphasis />
          </dl>
        </div>
      </div>

      {valid.error && valid.message && (
        <p className="border-t pt-5 text-sm text-destructive">{valid.message}</p>
      )}

      <Button
        asChild={!valid.error}
        size="lg"
        disabled={valid.error}
        className="label-caps h-13 w-full"
      >
        {valid.error ? (
          <span>Checkout</span>
        ) : (
          // An Inertia visit, not a page load — Checkout-Begin is a ported
          // page. Never prefetched, though: base's Begin handler *writes* to
          // the basket (it fills empty shipments, revalidates the currency,
          // recalculates, and copies the default address onto the shipment),
          // and none of that should happen because a pointer crossed a button.
          <Link href={checkoutBegin({})} prefetch={false}>
            Checkout
          </Link>
        )}
      </Button>
    </aside>
  );
}
