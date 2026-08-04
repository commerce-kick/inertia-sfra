import { Barcode } from "@/components/commerce/barcode";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import type { IRefinementData } from "@/generated/data";
import { router } from "@inertiajs/react";
import { useState } from "react";

const PRICE_CEILING = 1000;

function visit(url: string) {
  router.get(url, {}, { preserveState: true, preserveScroll: true });
}

/** Build the current search URL with pmin/pmax replaced and paging reset. */
function priceUrl(currentUrl: string, min: number, max: number) {
  const url = new URL(currentUrl, window.location.origin);
  url.searchParams.delete("start");
  if (min > 0) url.searchParams.set("pmin", String(min));
  else url.searchParams.delete("pmin");
  if (max < PRICE_CEILING) url.searchParams.set("pmax", String(max));
  else url.searchParams.delete("pmax");
  return url.pathname + url.search;
}

function PriceRange({ currentUrl }: { currentUrl: string }) {
  const params = new URL(currentUrl, "http://x").searchParams;
  const [range, setRange] = useState<[number, number]>([
    Number(params.get("pmin")) || 0,
    Number(params.get("pmax")) || PRICE_CEILING,
  ]);

  return (
    <div className="flex flex-col gap-3 px-1 pt-1">
      <Slider
        value={range}
        min={0}
        max={PRICE_CEILING}
        step={10}
        onValueChange={(value) => setRange(value as [number, number])}
        onValueCommit={(value) =>
          visit(priceUrl(currentUrl, value[0] ?? 0, value[1] ?? PRICE_CEILING))
        }
        aria-label="Rango de precio"
      />
      <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
        <span>${range[0]}</span>
        <span>{range[1] >= PRICE_CEILING ? `$${PRICE_CEILING}+` : `$${range[1]}`}</span>
      </div>
    </div>
  );
}

/**
 * The refinement rail: server-defined groups render data-driven (checkbox
 * lists with hit counts, tear-off ticket look); the price range rides along
 * always since pmin/pmax filter regardless of Business Manager refinement
 * definitions.
 */
export function RefinementPanel({
  refinements,
  currentUrl,
}: {
  refinements: IRefinementData[];
  currentUrl: string;
}) {
  const groups = refinements.filter((group) => group.values?.length);

  return (
    <Accordion
      type="multiple"
      defaultValue={["price", ...groups.map((_, i) => `group-${i}`)]}
      className="w-full"
    >
      {groups.map((group, i) => (
        <AccordionItem key={group.displayName} value={`group-${i}`}>
          <AccordionTrigger className="ticket-caps text-xs hover:no-underline">
            {group.displayName}
          </AccordionTrigger>
          <AccordionContent>
            <ul className="flex flex-col gap-2.5 px-1 pt-1">
              {group.values?.map((value) => (
                <li key={value.id || value.displayValue}>
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm">
                    <Checkbox
                      checked={value.selected}
                      disabled={!value.selectable && !value.selected}
                      onCheckedChange={() => value.url && visit(value.url)}
                    />
                    <span className="flex-1">{value.displayValue}</span>
                    {value.hitCount > 0 && (
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {value.hitCount}
                      </span>
                    )}
                  </label>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      ))}

      <AccordionItem value="price">
        <AccordionTrigger className="ticket-caps text-xs hover:no-underline">
          Precio
        </AccordionTrigger>
        <AccordionContent>
          <PriceRange currentUrl={currentUrl} />
        </AccordionContent>
      </AccordionItem>

      <div className="flex justify-center pt-6">
        <Barcode value="FILTER-TICKET" className="w-24 text-foreground/20" />
      </div>
    </Accordion>
  );
}
