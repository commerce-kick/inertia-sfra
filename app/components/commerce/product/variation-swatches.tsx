import { Badge } from "@/components/ui/badge";
import type { IProductDetailData } from "@/generated/data";

/**
 * Variation attributes: image swatches where the attribute is swatchable and
 * the value carries one, labelled chips otherwise. Selection is display-only
 * until Product-Variation is wired (row 1.5).
 */
function VariationSwatches({
  attributes,
}: {
  attributes: IProductDetailData["variationAttributes"];
}) {
  return (
    <>
      {attributes.map((attr) => (
        <div key={attr.id} className="flex flex-col gap-2.5">
          <span className="label-caps text-muted-foreground">
            {attr.displayName || attr.id}
          </span>
          <div className="flex flex-wrap gap-2">
            {attr.values.map((value) =>
              attr.swatchable && value.image ? (
                <span
                  key={value.id}
                  title={value.displayValue}
                  className={`size-10 overflow-hidden border p-0.5 ${
                    value.selected
                      ? "border-foreground"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={value.image.url}
                    alt={value.displayValue}
                    className="size-full object-cover"
                  />
                </span>
              ) : (
                <Badge
                  key={value.id}
                  variant={value.selected ? "default" : "outline"}
                  className="label-caps px-3 py-1.5"
                >
                  {value.displayValue}
                </Badge>
              )
            )}
          </div>
        </div>
      ))}
    </>
  );
}

export { VariationSwatches };
