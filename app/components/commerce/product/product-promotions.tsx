import type { IProductDetailData } from "@/generated/data";

/**
 * Active promotion callouts. Base showed these on both the PDP and quickview;
 * `calloutMsg` is Business-Manager-authored markup, same as the description.
 */
function ProductPromotions({
  promotions,
}: {
  promotions: IProductDetailData["promotions"];
}) {
  const callouts = promotions.filter((promotion) => promotion.calloutMsg);
  if (callouts.length === 0) return null;

  return (
    <ul className="flex w-full flex-col gap-1.5">
      {callouts.map((promotion) => (
        <li key={promotion.id} className="flex items-baseline gap-2 text-sm">
          <span className="mt-1.5 size-1.5 shrink-0 bg-foreground" aria-hidden />
          <span
            // Server-authored promotion markup (Business Manager content).
            dangerouslySetInnerHTML={{ __html: promotion.calloutMsg }}
          />
        </li>
      ))}
    </ul>
  );
}

export { ProductPromotions };
