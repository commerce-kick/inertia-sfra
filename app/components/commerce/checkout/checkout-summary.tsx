import { Link } from "@/components/link";
import { ProductThumb } from "@/components/commerce/product-thumb";
import type { ICheckoutOrderData } from "@/generated/data";
import { cartShow } from "@/generated/routes/cart-show";
import { cn } from "@/lib/utils";

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
 * What is being bought, beside what is being filled in.
 *
 * The same figures the bag prints, from the same `CartTotalsData` — including
 * the "-" the platform returns for shipping and tax until a method and a
 * jurisdiction exist, which is precisely what the shipping stage settles.
 */
export function CheckoutSummary({ order }: { order: ICheckoutOrderData }) {
  const { totals } = order;

  return (
    <aside className="flex flex-col gap-8 lg:sticky lg:top-24 lg:self-start">
      <div className="flex flex-col gap-5 border-t pt-5">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="label-caps">Order</h2>
          <Link
            href={cartShow({})}
            className="link-draw label-caps text-muted-foreground transition-colors hover:text-foreground"
          >
            Edit bag
          </Link>
        </div>

        <ul className="flex flex-col gap-5">
          {order.items.map((item) => (
            <li key={item.uuid} className="flex gap-4">
              <ProductThumb
                image={item.image}
                width={64}
                className="w-16 shrink-0"
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
      </div>

      <dl className="flex flex-col gap-3 border-t pt-5">
        <Row label="Subtotal" value={totals.subTotal} />
        <Row label="Shipping" value={totals.totalShippingCost} />
        <Row label="Tax" value={totals.totalTax} />
        <Row label="Total" value={totals.grandTotal} emphasis />
      </dl>
    </aside>
  );
}
