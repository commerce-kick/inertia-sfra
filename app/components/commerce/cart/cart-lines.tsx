import { LineItem } from "./line-item";
import type { ICartLineItemData } from "@/generated/data";

/**
 * The bag's lines, hairline-separated. Three arrangements of the same
 * compound parts, exactly as base kept three product-card templates: the
 * line whose product left the catalog carries no price and no controls, a
 * bundle names what it includes, everything else is the ordinary line.
 */
export function CartLines({ items }: { items: ICartLineItemData[] }) {
  return (
    <ul className="divide-y border-b">
      {items.map((item) => (
        <li key={item.uuid}>
          <LineItem item={item}>
            <LineItem.Media />
            <LineItem.Body>
              <LineItem.Title />
              {item.noProduct ? (
                <LineItem.Unavailable />
              ) : (
                <>
                  <LineItem.Attributes />
                  <LineItem.Availability />
                  <LineItem.Money />
                  <LineItem.Promotions />
                  <LineItem.Bundle />
                </>
              )}
              <LineItem.Bonus />
            </LineItem.Body>
          </LineItem>
        </li>
      ))}
    </ul>
  );
}
