import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import type { IAddressData, ICheckoutOrderData } from "@/generated/data";
import { checkoutBegin } from "@/generated/routes/checkout-begin";
import { usePlaceOrder } from "@/lib/queries/checkout";
import { router } from "@inertiajs/react";

function AddressBlock({ address }: { address: IAddressData | null }) {
  if (!address) {
    return <p className="text-sm text-muted-foreground">Not set.</p>;
  }

  return (
    <div className="flex flex-col gap-1 text-sm leading-relaxed">
      <span>
        {address.firstName} {address.lastName}
      </span>
      <span>{address.address1}</span>
      {address.address2 && <span>{address.address2}</span>}
      <span>
        {address.city}, {address.stateCode} {address.postalCode}
      </span>
      {address.phone && <span>{address.phone}</span>}
    </div>
  );
}

function ReviewPanel({
  title,
  stage,
  children,
}: {
  title: string;
  stage: "shipping" | "payment";
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 border-t pt-5">
      <header className="flex items-baseline justify-between gap-4">
        <h2 className="label-caps">{title}</h2>
        <Link
          href={checkoutBegin({ stage })}
          className="link-draw label-caps text-muted-foreground transition-colors hover:text-foreground"
        >
          Change
        </Link>
      </header>
      {children}
    </section>
  );
}

/**
 * The last look before the order exists.
 *
 * Everything here was settled by a previous stage and is shown as the server
 * now holds it — not as it was typed. The card is whatever the platform is
 * willing to show of it, which is a masked number and an expiry.
 *
 * Placing the order is the one irreversible act in the storefront, so the
 * button says what it does and nothing moves optimistically: on success the
 * shopper goes where base sent them, carrying the order number and the token
 * that lets a guest see it.
 */
export function ReviewStage({ order }: { order: ICheckoutOrderData }) {
  const placeOrder = usePlaceOrder();
  const shipment = order.shipping[0];
  const payment = order.billing?.selectedPaymentInstruments?.[0];

  return (
    <div className="flex flex-col gap-8">
      <ReviewPanel title="Ships to" stage="shipping">
        <AddressBlock address={shipment?.shippingAddress ?? null} />
        {shipment?.selectedShippingMethod && (
          <p className="meta-caps text-muted-foreground">
            {shipment.selectedShippingMethod.displayName} ·{" "}
            {shipment.selectedShippingMethod.shippingCost}
          </p>
        )}
      </ReviewPanel>

      <ReviewPanel title="Bills to" stage="payment">
        <AddressBlock address={order.billing?.billingAddress ?? null} />
        {payment && (
          <p className="meta-caps text-muted-foreground">
            {payment.cardType} {payment.maskedNumber} ·{" "}
            {String(payment.expirationMonth).padStart(2, "0")}/
            {payment.expirationYear}
          </p>
        )}
      </ReviewPanel>

      {order.orderEmail && (
        <section className="flex flex-col gap-2 border-t pt-5">
          <h2 className="label-caps">Confirmation to</h2>
          <p className="text-sm leading-relaxed">{order.orderEmail}</p>
        </section>
      )}

      {placeOrder.isError && (
        <p role="alert" className="text-sm text-destructive">
          {placeOrder.error.message}
        </p>
      )}

      <Button
        disabled={placeOrder.isPending}
        className="label-caps h-13 w-full sm:max-w-sm"
        onClick={() =>
          placeOrder.mutate(undefined, {
            onSuccess: (result) => {
              // Base hands the order number and its token to Order-Confirm as
              // a form POST, and that is what this is: the two facts travel in
              // the body, so a placed order is not left sitting in browser
              // history or leaking through a referrer. The field names are
              // base's own — the route reads them off `req.form`.
              router.post(result.continueUrl, {
                orderID: result.orderId,
                orderToken: result.orderToken,
              });
            },
          })
        }
      >
        {placeOrder.isPending ? "Placing order" : `Place order · ${order.totals.grandTotal}`}
      </Button>
    </div>
  );
}
