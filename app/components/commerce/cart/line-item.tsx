import { AspectRatio } from "@/components/ui/aspect-ratio";
import type { ICartBonusLineItemData, ICartLineItemData } from "@/generated/data";
import { cn } from "@/lib/utils";
import { ImageOff } from "lucide-react";
import { createContext, useContext, useState } from "react";

/**
 * One line of the bag, as a compound component: the row supplies the item
 * through context and the caller assembles the parts it wants, so the
 * ordinary line, the bundle and the line whose product left the catalog are
 * three arrangements of the same pieces rather than three prop-configured
 * variants.
 *
 *   <LineItem item={item}>
 *     <LineItem.Media />
 *     <div>
 *       <LineItem.Title />
 *       <LineItem.Attributes />
 *       <LineItem.Money />
 *     </div>
 *   </LineItem>
 */
const LineItemContext = createContext<ICartLineItemData | null>(null);

function useLineItem() {
  const item = useContext(LineItemContext);
  if (!item) throw new Error("LineItem parts must render inside <LineItem>");
  return item;
}

/** Bare photograph on a quiet ground — no card chrome (DESIGN.md). */
function Thumbnail({
  image,
  className,
}: {
  image: { url: string; alt: string } | null;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);
  const shown = broken ? null : image;

  return (
    <div className={cn("overflow-hidden bg-muted", className)}>
      <AspectRatio ratio={4 / 5}>
        {shown ? (
          <img
            src={shown.url}
            alt={shown.alt}
            loading="lazy"
            onError={() => setBroken(true)}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-1.5 text-muted-foreground">
            <ImageOff className="size-4" aria-hidden />
            <span className="meta-caps">No photo</span>
          </div>
        )}
      </AspectRatio>
    </div>
  );
}

function LineItemRoot({
  item,
  children,
  className,
}: {
  item: ICartLineItemData;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <LineItemContext.Provider value={item}>
      <article
        className={cn(
          "grid grid-cols-[5.5rem_1fr] gap-5 py-8 sm:grid-cols-[8rem_1fr] sm:gap-8",
          className
        )}
      >
        {children}
      </article>
    </LineItemContext.Provider>
  );
}

function LineItemMedia() {
  const item = useLineItem();
  return <Thumbnail image={item.image} />;
}

function LineItemBody({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-4">{children}</div>;
}

function LineItemTitle({ children }: { children?: React.ReactNode }) {
  const item = useLineItem();

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-1.5">
        {item.isBonus && (
          <span className="label-caps text-muted-foreground">Bonus</span>
        )}
        <h2 className="label-caps">{item.productName}</h2>
        <span className="meta-caps text-muted-foreground">{item.id}</span>
      </div>
      {children}
    </div>
  );
}

/** Variation values and chosen options — "Color: Black", one line each. */
function LineItemAttributes() {
  const item = useLineItem();
  if (!item.variationAttributes.length && !item.options.length) return null;

  return (
    <dl className="flex flex-col gap-1 text-sm text-muted-foreground">
      {item.variationAttributes.map((attribute) => (
        <div key={attribute.displayName} className="flex gap-2">
          <dt>{attribute.displayName}:</dt>
          <dd className="text-foreground">{attribute.displayValue}</dd>
        </div>
      ))}
      {item.options.map((option) => (
        <div key={option.optionId}>
          <dd className="text-foreground">{option.displayName}</dd>
        </div>
      ))}
    </dl>
  );
}

function LineItemAvailability() {
  const item = useLineItem();
  const { messages, inStockDate } = item.availability;
  if (!messages.length && !inStockDate) return null;

  return (
    <div className="flex flex-col gap-1">
      {messages.map((message) => (
        <span key={message} className="meta-caps text-muted-foreground">
          {message}
        </span>
      ))}
      {inStockDate && (
        <span className="meta-caps text-muted-foreground">{inStockDate}</span>
      )}
    </div>
  );
}

function LineItemPromotions() {
  const item = useLineItem();
  if (!item.promotions.length) return null;

  return (
    <ul className="flex flex-col gap-1">
      {item.promotions.map((promotion, index) => (
        <li
          key={`${promotion.name}-${index}`}
          className="text-sm text-muted-foreground"
          // Callout copy is merchant-authored markup (Business Manager).
          dangerouslySetInnerHTML={{
            __html: promotion.callOutMsg || promotion.name,
          }}
        />
      ))}
    </ul>
  );
}

/**
 * The money row: per-unit price, quantity, line total. Mono throughout —
 * every value here is data. `quantity` takes over the middle cell for the
 * rows that can change it.
 */
function LineItemMoney({ quantity }: { quantity?: React.ReactNode }) {
  const item = useLineItem();
  const unit = item.unitPrice;

  return (
    <dl className="flex flex-wrap items-start gap-x-10 gap-y-4 pt-1">
      <div className="flex flex-col gap-1.5">
        <dt className="label-caps text-muted-foreground">Each</dt>
        <dd className="meta-caps">
          {unit?.isRange && unit.min && unit.max
            ? `${unit.min.formatted}–${unit.max.formatted}`
            : unit?.sales?.formatted}
          {unit?.list && (
            <s className="ml-2 text-muted-foreground">{unit.list.formatted}</s>
          )}
        </dd>
      </div>
      <div className="flex flex-col gap-1.5">
        <dt className="label-caps text-muted-foreground">Qty</dt>
        <dd className="meta-caps">{quantity ?? item.quantity}</dd>
      </div>
      <div className="flex flex-col gap-1.5">
        <dt className="label-caps text-muted-foreground">Total</dt>
        <dd className="meta-caps">
          {item.totalPriceUndiscounted && (
            <s className="mr-2 text-muted-foreground">
              {item.totalPriceUndiscounted}
            </s>
          )}
          {item.totalPrice}
        </dd>
      </div>
    </dl>
  );
}

/** What a bundle includes — name, photograph and ordered values, no prices. */
function LineItemBundle() {
  const item = useLineItem();
  if (!item.bundledItems.length) return null;

  return (
    <div className="flex flex-col gap-4 border-t pt-4">
      <span className="label-caps text-muted-foreground">This bundle includes</span>
      <ul className="flex flex-col gap-4">
        {item.bundledItems.map((bundled) => (
          <li key={bundled.id} className="grid grid-cols-[3.5rem_1fr] gap-4">
            <Thumbnail image={bundled.image} />
            <div className="flex flex-col gap-1.5">
              <span className="label-caps">{bundled.productName}</span>
              {bundled.variationAttributes.map((attribute) => (
                <span
                  key={attribute.displayName}
                  className="text-sm text-muted-foreground"
                >
                  {attribute.displayName}: {attribute.displayValue}
                </span>
              ))}
              {bundled.options.map((option) => (
                <span key={option.optionId} className="text-sm text-muted-foreground">
                  {option.displayName}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BonusRow({ bonus }: { bonus: ICartBonusLineItemData }) {
  return (
    <li className="grid grid-cols-[3.5rem_1fr] gap-4">
      <Thumbnail image={bonus.image} />
      <div className="flex flex-col gap-1.5">
        <span className="label-caps">{bonus.productName}</span>
        {bonus.variationAttributes.map((attribute) => (
          <span key={attribute.displayName} className="text-sm text-muted-foreground">
            {attribute.displayName}: {attribute.displayValue}
          </span>
        ))}
        <span className="meta-caps text-muted-foreground">
          {bonus.quantity} × {bonus.unitPrice || bonus.totalPrice}
        </span>
      </div>
    </li>
  );
}

/** The bonus products this line earned, nested beneath it as base nested them. */
function LineItemBonus({ children }: { children?: React.ReactNode }) {
  const item = useLineItem();
  if (!item.bonusProducts.length && !children) return null;

  return (
    <div className="flex flex-col gap-4 border-t pt-4">
      {item.bonusProducts.length > 0 && (
        <>
          <span className="label-caps text-muted-foreground">
            Bonus with this item
          </span>
          <ul className="flex flex-col gap-4">
            {item.bonusProducts.map((bonus) => (
              <BonusRow key={bonus.uuid} bonus={bonus} />
            ))}
          </ul>
        </>
      )}
      {children}
    </div>
  );
}

/** The line whose product left the online catalog — base's uncategorized card. */
function LineItemUnavailable() {
  return (
    <p className="text-sm text-destructive">
      This product has been removed from the online catalog.
    </p>
  );
}

export const LineItem = Object.assign(LineItemRoot, {
  Media: LineItemMedia,
  Body: LineItemBody,
  Title: LineItemTitle,
  Attributes: LineItemAttributes,
  Availability: LineItemAvailability,
  Promotions: LineItemPromotions,
  Money: LineItemMoney,
  Bundle: LineItemBundle,
  Bonus: LineItemBonus,
  Unavailable: LineItemUnavailable,
});
