import type { ICartData } from "@/generated/data";

/**
 * What the basket is close to earning. Base assembled the sentence on the
 * server out of a resource template; the two facts arrive separately now, so
 * the amount stays mono (it is data) and the promotion speaks in its own
 * merchant-authored voice.
 */
export function ApproachingDiscounts({
  discounts,
}: {
  discounts: ICartData["approachingDiscounts"];
}) {
  if (!discounts.length) return null;

  return (
    <ul className="flex flex-col gap-2 border-t pt-5">
      {discounts.map((discount, index) => (
        <li
          key={`${discount.distance}-${index}`}
          className="flex flex-wrap items-baseline gap-2 text-sm"
        >
          <span className="label-caps text-muted-foreground">Spend</span>
          <span className="meta-caps">{discount.distance}</span>
          <span className="label-caps text-muted-foreground">more to get</span>
          <span
            // Callout copy is merchant-authored markup (Business Manager).
            dangerouslySetInnerHTML={{ __html: discount.calloutMsg }}
          />
        </li>
      ))}
    </ul>
  );
}
