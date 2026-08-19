import { Link } from "@/components/link";
import type { IProductDetailData } from "@/generated/data";
import { cn } from "@/lib/utils";

type Attribute = IProductDetailData["variationAttributes"][number];
type Value = Attribute["values"][number];

/** Partial visit: only `product` changes when a variant is selected. */
const VISIT = { only: ["product"], preserveScroll: true };

/**
 * One image swatch. Selectable values are real links — the server owns the
 * selection, so the URL always names the variant on screen.
 */
function Swatch({ value }: { value: Value }) {
  const image = value.image;
  if (!image) return null;

  const frame = cn(
    "block size-10 overflow-hidden border p-0.5 transition-colors duration-(--motion-fast) ease-(--motion-ease)",
    value.selected
      ? "border-foreground"
      : "border-transparent hover:border-border",
    !value.selectable && "cursor-not-allowed opacity-30"
  );
  const img = (
    <img
      src={image.url}
      alt=""
      className="size-full object-cover"
      aria-hidden
    />
  );

  if (!value.selectable) {
    return (
      <span className={frame} title={value.displayValue} aria-disabled>
        {img}
        <span className="sr-only">{value.displayValue} — unavailable</span>
      </span>
    );
  }

  return (
    <Link
      href={value.url}
      {...VISIT}
      title={value.displayValue}
      aria-current={value.selected || undefined}
      className={cn(
        frame,
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      )}
    >
      {img}
      <span className="sr-only">{value.displayValue}</span>
    </Link>
  );
}

/** One labelled chip, for attributes without swatch imagery (size, width…). */
function Chip({ value }: { value: Value }) {
  const shape =
    "label-caps inline-flex min-w-11 items-center justify-center border px-3 py-1.5 transition-colors duration-(--motion-fast) ease-(--motion-ease)";

  if (!value.selectable) {
    return (
      <span
        className={cn(
          shape,
          "cursor-not-allowed border-border text-muted-foreground line-through"
        )}
        aria-disabled
      >
        {value.displayValue}
        <span className="sr-only"> — unavailable</span>
      </span>
    );
  }

  return (
    <Link
      href={value.url}
      {...VISIT}
      aria-current={value.selected || undefined}
      className={cn(
        shape,
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        value.selected
          ? "border-foreground bg-foreground text-background"
          : "border-border hover:border-foreground"
      )}
    >
      {value.displayValue}
    </Link>
  );
}

/**
 * Variation attributes — colour, size, and whatever else the catalog defines.
 *
 * Selection is server-owned: every value carries the Product-Show URL that
 * selects it (ProductDetailData rewrites SFRA's Product-Variation URLs), so a
 * click is a partial visit that re-renders `product` with the chosen variant.
 * That keeps the selection in the address bar and out of client state.
 * Values with no orderable variant arrive without a URL and render inert.
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
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="label-caps text-muted-foreground">
              {attr.displayName || attr.id}
              {attr.displayValue && (
                <span className="text-foreground"> · {attr.displayValue}</span>
              )}
            </span>
            {attr.displayValue && attr.resetUrl && (
              <Link
                href={attr.resetUrl}
                {...VISIT}
                className="link-draw label-caps text-muted-foreground"
              >
                Clear
              </Link>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {attr.values.map((value) =>
              attr.swatchable && value.image ? (
                <Swatch key={value.id} value={value} />
              ) : (
                <Chip key={value.id} value={value} />
              )
            )}
          </div>
        </div>
      ))}
    </>
  );
}

export { VariationSwatches };
