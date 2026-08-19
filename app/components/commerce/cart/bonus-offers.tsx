import { BonusChooser } from "./bonus-chooser";
import { Button } from "@/components/ui/button";
import type { ICartLineItemData } from "@/generated/data";
import { useEditBonusProduct } from "@/lib/queries/cart";
import { useState } from "react";

/**
 * The choice-of-bonus offers a line has earned, as the button base gave them.
 *
 * The offer itself is server-authored: clicking asks Cart-EditBonusProduct
 * for it, and the chooser opens on what comes back — the same shape
 * Cart-AddProduct hands over when an addition earns one.
 *
 * Base labelled the button by whether the promotion still has room ("Select
 * Bonus Products" while it does, "Change Bonus Products" once it is full),
 * which is the one thing the shopper needs to know before opening it.
 */
export function BonusOffers({ item }: { item: ICartLineItemData }) {
  const [duuid, setDuuid] = useState<string | null>(null);
  const { data, isFetching } = useEditBonusProduct(duuid);

  if (!item.bonusOffers.length) return null;

  return (
    <>
      <div className="flex flex-wrap gap-3">
        {item.bonusOffers.map((offer) => (
          <Button
            key={offer.uuid}
            variant="outline"
            disabled={isFetching && duuid === offer.uuid}
            onClick={() => setDuuid(offer.uuid)}
            className="label-caps h-11 px-8"
          >
            {offer.canSelect ? "Select bonus products" : "Change bonus products"}
          </Button>
        ))}
      </div>

      <BonusChooser
        offer={duuid ? (data ?? null) : null}
        onOpenChange={(open) => {
          if (!open) setDuuid(null);
        }}
      />
    </>
  );
}
