import { Section } from "@/components/commerce/section";
import { Link } from "@/components/link";
import { ProductThumb } from "@/components/commerce/product-thumb";
import { Button } from "@/components/ui/button";
import { homeShow } from "@/generated/routes/home-show";
import type { OrderConfirmProps } from "@/types/checkout";
import { Head, usePage } from "@inertiajs/react";

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="label-caps text-muted-foreground">{label}</dt>
      <dd className="text-sm leading-relaxed">{children}</dd>
    </div>
  );
}

/**
 * The order exists. Everything here is read from the order the platform
 * created, not from what was typed into checkout a moment ago — which is the
 * whole point of a confirmation.
 */
export default function Confirm() {
  const { confirmation } = usePage<OrderConfirmProps>().props;
  const { order } = confirmation;
  const shipment = order.shipping[0];
  const payment = order.billing?.selectedPaymentInstruments?.[0];

  return (
    <>
      <Head title={`Order ${confirmation.orderNumber} — Meridian`} />

      <Section
        title="Thank you"
        titleAs="h1"
        subtitle="Your order is placed. A confirmation is on its way to your inbox."
        className="pb-24"
      >
        <div className="grid gap-12 lg:grid-cols-[1fr_20rem] lg:gap-16">
          <div className="flex flex-col gap-10">
            <dl className="grid gap-6 border-t pt-5 sm:grid-cols-3">
              <Fact label="Order">
                <span className="meta-caps">{confirmation.orderNumber}</span>
              </Fact>
              <Fact label="Placed">
                <span className="meta-caps">{confirmation.creationDate}</span>
              </Fact>
              <Fact label="Status">{confirmation.status}</Fact>
            </dl>

            <section className="flex flex-col gap-4 border-t pt-5">
              <h2 className="label-caps">Ships to</h2>
              {shipment?.shippingAddress ? (
                <div className="flex flex-col gap-1 text-sm leading-relaxed">
                  <span>
                    {shipment.shippingAddress.firstName}{" "}
                    {shipment.shippingAddress.lastName}
                  </span>
                  <span>{shipment.shippingAddress.address1}</span>
                  {shipment.shippingAddress.address2 && (
                    <span>{shipment.shippingAddress.address2}</span>
                  )}
                  <span>
                    {shipment.shippingAddress.city},{" "}
                    {shipment.shippingAddress.stateCode}{" "}
                    {shipment.shippingAddress.postalCode}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Not shipped.</p>
              )}
              {shipment?.selectedShippingMethod && (
                <p className="meta-caps text-muted-foreground">
                  {shipment.selectedShippingMethod.displayName}
                </p>
              )}
            </section>

            <section className="flex flex-col gap-4 border-t pt-5">
              <h2 className="label-caps">Paid with</h2>
              {payment ? (
                <p className="meta-caps">
                  {payment.cardType} {payment.maskedNumber}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">—</p>
              )}
              {order.orderEmail && (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Confirmation sent to {order.orderEmail}
                </p>
              )}
            </section>

            <section className="flex flex-col gap-5 border-t pt-5">
              <h2 className="label-caps">
                {order.numItems === 1 ? "1 item" : `${order.numItems} items`}
              </h2>
              <ul className="flex flex-col gap-6">
                {order.items.map((item) => (
                  <li key={item.uuid} className="flex gap-5">
                    <ProductThumb
                      image={item.image}
                      width={80}
                      className="w-20 shrink-0"
                    />
                    <div className="flex flex-1 flex-col gap-1">
                      <span className="label-caps">{item.productName}</span>
                      <span className="meta-caps text-muted-foreground">
                        Qty {item.quantity}
                      </span>
                      {item.totalPrice && (
                        <span className="meta-caps">{item.totalPrice}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <Button asChild variant="outline" className="label-caps h-12 w-fit px-8">
              <Link href={homeShow({})}>Continue shopping</Link>
            </Button>
          </div>

          <aside className="flex flex-col gap-3 border-t pt-5 lg:sticky lg:top-24 lg:self-start">
            <h2 className="label-caps">Total</h2>
            <dl className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between gap-6">
                <dt className="label-caps text-muted-foreground">Subtotal</dt>
                <dd className="meta-caps">{order.totals.subTotal}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-6">
                <dt className="label-caps text-muted-foreground">Shipping</dt>
                <dd className="meta-caps">{order.totals.totalShippingCost}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-6">
                <dt className="label-caps text-muted-foreground">Tax</dt>
                <dd className="meta-caps">{order.totals.totalTax}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-6 border-t pt-3">
                <dt className="label-caps">Total</dt>
                <dd className="meta-caps text-base">{order.totals.grandTotal}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </Section>
    </>
  );
}
