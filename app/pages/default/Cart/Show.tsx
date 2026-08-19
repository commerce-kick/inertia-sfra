import { ApproachingDiscounts } from "@/components/commerce/cart/approaching-discounts";
import { CartDiscounts } from "@/components/commerce/cart/cart-discounts";
import { CartLines } from "@/components/commerce/cart/cart-lines";
import { CartSummary } from "@/components/commerce/cart/cart-summary";
import { EmptyBag } from "@/components/commerce/cart/empty-bag";
import { ShippingMethods } from "@/components/commerce/cart/shipping-methods";
import { Section } from "@/components/commerce/section";
import type { CartShowProps } from "@/types/cart";
import { Head, usePage } from "@inertiajs/react";

export default function Show() {
  const { cart } = usePage<CartShowProps>().props;

  return (
    <>
      <Head title="Bag — Meridian" />

      <Section
        title="Bag"
        meta={cart.numItems === 1 ? "1 item" : `${cart.numItems} items`}
        className="pb-20"
      >
        {cart.items.length === 0 ? (
          <EmptyBag />
        ) : (
          <div className="grid gap-12 lg:grid-cols-[1fr_20rem] lg:gap-16">
            <div className="flex flex-col gap-8">
              <CartLines items={cart.items} />
              <ApproachingDiscounts discounts={cart.approachingDiscounts} />
            </div>

            <CartSummary cart={cart}>
              <CartDiscounts discounts={cart.totals.discounts} />
              <ShippingMethods cart={cart} />
            </CartSummary>
          </div>
        )}
      </Section>
    </>
  );
}
