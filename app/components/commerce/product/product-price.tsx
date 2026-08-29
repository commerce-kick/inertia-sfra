import type { IProductDetailData } from "@/generated/data";

/** The PDP price. Mono, because a price is data (DESIGN.md, Mono-Is-Data). */
function ProductPrice({ price }: { price: IProductDetailData["price"] }) {
  if (!price) return null;
  return (
    <div className="flex items-baseline gap-3">
      <span className="font-mono text-xl tracking-[0.04em]">
        {price.isRange && price.min && price.max
          ? `${price.min.formatted}–${price.max.formatted}`
          : price.sales?.formatted}
      </span>
      {price.list && (
        <s className="font-mono text-sm text-muted-foreground">
          {price.list.formatted}
        </s>
      )}
    </div>
  );
}

export { ProductPrice };
