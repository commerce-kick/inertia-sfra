import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import type { IProductDetailData } from "@/generated/data";
import { useSizeChart } from "@/lib/queries/product";
import { useState } from "react";

const ITEM = "size-chart";

/**
 * The size chart: a disclosure beneath the variation swatches.
 *
 * Base showed it only for a variated product whose category names a chart
 * asset, and fetched that asset's body the first time the link was clicked —
 * both kept here, the fetch gated on the accordion being open. Base's
 * collapsible was an absolutely-positioned overlay that also closed on any
 * outside click; this is inline flow content, so it closes from its own
 * control (nothing is covered while it is open).
 *
 * The asset's body is authored against SFRA's Bootstrap, which this storefront
 * does not ship — `cms-body` maps those tags onto the three voices instead.
 */
function SizeChart({ product }: { product: IProductDetailData }) {
  const [open, setOpen] = useState("");
  const { data, isPending, isError } = useSizeChart(
    product.sizeChartId,
    open === ITEM
  );

  // Base gate: a chart is only meaningful on a product that has sizes.
  if (!product.sizeChartId || product.variationAttributes.length === 0) {
    return null;
  }

  return (
    <Accordion
      type="single"
      collapsible
      value={open}
      onValueChange={setOpen}
      className="w-full border-t"
    >
      <AccordionItem value={ITEM}>
        <AccordionTrigger className="label-caps hover:no-underline">
          Size Chart
        </AccordionTrigger>
        <AccordionContent>
          {isPending && (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-5/6" />
              <Skeleton className="h-5 w-2/3" />
            </div>
          )}

          {(isError || (data && !data.success)) && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              This size chart could not be loaded.
            </p>
          )}

          {data?.success && (
            <div
              className="cms-body overflow-x-auto"
              // Server-authored content asset body (Business Manager content).
              dangerouslySetInnerHTML={{ __html: data.content }}
            />
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export { SizeChart };
