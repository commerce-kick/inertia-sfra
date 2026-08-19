import type { ICartDiscountData } from "@/generated/data";

/**
 * Coupons the shopper entered and promotions the campaign engine applied,
 * in one list because base's totals model keyed them into one array.
 *
 * A coupon that is in the basket but granted nothing says so — base printed
 * "applied" or "not applied" beside every code, which is the difference
 * between a code the engine accepted and one whose conditions the basket
 * does not meet.
 */
export function CartDiscounts({
  discounts,
  action,
}: {
  discounts: ICartDiscountData[];
  action?: (discount: ICartDiscountData) => React.ReactNode;
}) {
  if (!discounts.length) return null;

  return (
    <ul className="flex flex-col gap-4 border-t pt-5">
      {discounts.map((discount) => (
        <li key={discount.uuid} className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-4">
            {discount.type === "coupon" ? (
              <span className="flex flex-wrap items-baseline gap-2">
                <span className="meta-caps">{discount.couponCode}</span>
                <span className="label-caps text-muted-foreground">
                  {discount.applied ? "applied" : "not applied"}
                </span>
              </span>
            ) : (
              <span className="label-caps">{discount.lineItemText}</span>
            )}
            {discount.type === "coupon"
              ? action?.(discount)
              : discount.price && (
                  <span className="meta-caps">− {discount.price}</span>
                )}
          </div>
          {discount.callouts.map((callout, index) => (
            <span
              key={index}
              className="text-sm text-muted-foreground"
              // Callout copy is merchant-authored markup (Business Manager).
              dangerouslySetInnerHTML={{ __html: callout }}
            />
          ))}
        </li>
      ))}
    </ul>
  );
}
