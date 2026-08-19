import { Skeleton } from "@/components/ui/skeleton";
import type { IProductDetailData } from "@/generated/data";
import { useSizeChart } from "@/lib/queries/product";
import { useState } from "react";

/**
 * The size chart: a disclosure beneath the variation swatches.
 *
 * Base showed it only for a variated product whose category names a chart
 * asset, and fetched that asset's body the first time the link was clicked —
 * both kept here. Base's collapsible was an absolutely-positioned overlay that
 * also closed on any outside click; this one is inline flow content, so it
 * closes only from its own control (nothing is covered while it is open).
 */
function SizeChart({ product }: { product: IProductDetailData }) {
  const [open, setOpen] = useState(false);
  const { data, isPending, isError } = useSizeChart(product.sizeChartId, open);

  // Base gate: a chart is only meaningful on a product that has sizes.
  if (!product.sizeChartId || product.variationAttributes.length === 0) {
    return null;
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <button
        type="button"
        onClick={() => setOpen((wasOpen) => !wasOpen)}
        aria-expanded={open}
        aria-controls="size-chart-panel"
        className="link-draw label-caps self-start text-muted-foreground"
      >
        Size Chart
      </button>

      {open && (
        <div
          id="size-chart-panel"
          className="w-full overflow-x-auto border-t pt-4 text-sm leading-relaxed motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2"
        >
          {isPending && (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-5/6" />
              <Skeleton className="h-5 w-2/3" />
            </div>
          )}

          {(isError || (data && !data.success)) && (
            <p className="text-muted-foreground">
              This size chart could not be loaded.
            </p>
          )}

          {data?.success && (
            <div
              // Server-authored content asset body (Business Manager content).
              dangerouslySetInnerHTML={{ __html: data.content }}
            />
          )}
        </div>
      )}
    </div>
  );
}

export { SizeChart };
