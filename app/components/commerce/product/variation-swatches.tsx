import { Link } from "@/components/link";
import type { IProductDetailData } from "@/generated/data";
import { cn } from "@/lib/utils";

type Attribute = IProductDetailData["variationAttributes"][number];
type Value = Attribute["values"][number];

/** Partial visit: only `product` changes when a variant is selected. */
const VISIT = { only: ["product"], preserveScroll: true };

/**
 * How a selection is applied. The PDP navigates — a partial visit to the
 * value's Product-Show URL, so the choice lands in the address bar. Quickview
 * cannot navigate away from the PLP, so it passes a handler and swaps the
 * product in place through the Product-Variation JSON endpoint.
 */
type Select = ((variationUrl: string) => void) | undefined;

/**
 * One image swatch. Selectable values are real links — the server owns the
 * selection, so the URL always names the variant on screen.
 */
function Swatch({ value, onSelect }: { value: Value; onSelect: Select }) {
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

  const focus =
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={() => onSelect(value.variationUrl)}
        title={value.displayValue}
        aria-pressed={value.selected}
        className={cn(frame, focus)}
      >
        {img}
        <span className="sr-only">{value.displayValue}</span>
      </button>
    );
  }

  return (
    <Link
      href={value.url}
      {...VISIT}
      title={value.displayValue}
      aria-current={value.selected || undefined}
      className={cn(frame, focus)}
    >
      {img}
      <span className="sr-only">{value.displayValue}</span>
    </Link>
  );
}

/** One labelled chip, for attributes without swatch imagery (size, width…). */
function Chip({ value, onSelect }: { value: Value; onSelect: Select }) {
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

  const skin = cn(
    shape,
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    value.selected
      ? "border-foreground bg-foreground text-background"
      : "border-border hover:border-foreground"
  );

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={() => onSelect(value.variationUrl)}
        aria-pressed={value.selected}
        className={skin}
      >
        {value.displayValue}
      </button>
    );
  }

  return (
    <Link
      href={value.url}
      {...VISIT}
      aria-current={value.selected || undefined}
      className={skin}
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
  onSelect,
}: {
  attributes: IProductDetailData["variationAttributes"];
  onSelect?: (variationUrl: string) => void;
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
            {attr.displayValue && attr.resetUrl && !onSelect && (
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
                <Swatch key={value.id} value={value} onSelect={onSelect} />
              ) : (
                <Chip key={value.id} value={value} onSelect={onSelect} />
              )
            )}
          </div>
        </div>
      ))}
    </>
  );
}

export { VariationSwatches };
