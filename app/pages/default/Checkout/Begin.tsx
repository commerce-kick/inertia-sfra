import { CheckoutSteps } from "@/components/commerce/checkout/checkout-steps";
import { CheckoutSummary } from "@/components/commerce/checkout/checkout-summary";
import { CustomerStage } from "@/components/commerce/checkout/customer-stage";
import { PaymentStage } from "@/components/commerce/checkout/payment-stage";
import { ReviewStage } from "@/components/commerce/checkout/review-stage";
import { ShippingStage } from "@/components/commerce/checkout/shipping-stage";
import { Section } from "@/components/commerce/section";
import type { CheckoutBeginProps } from "@/types/checkout";
import { Head, usePage } from "@inertiajs/react";

export default function Begin() {
  const { order, stage, forms, registered, savedAddresses, savedCards } =
    usePage<CheckoutBeginProps>().props;

  return (
    <>
      <Head title="Checkout — Meridian" />

      <Section title="Checkout" titleAs="h1" className="pb-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_20rem] lg:gap-16">
          <div className="flex flex-col gap-10">
            <CheckoutSteps stage={stage} registered={registered} />

            {stage === "customer" && <CustomerStage forms={forms} />}
            {stage === "shipping" && (
              <ShippingStage
                order={order}
                forms={forms}
                savedAddresses={savedAddresses}
              />
            )}
            {stage === "payment" && (
              <PaymentStage order={order} forms={forms} savedCards={savedCards} />
            )}
            {stage === "placeOrder" && <ReviewStage order={order} />}
          </div>

          <CheckoutSummary order={order} />
        </div>
      </Section>
    </>
  );
}
