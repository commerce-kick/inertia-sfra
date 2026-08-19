import { BonusChooser } from "./bonus-chooser";
import { QuantitySelect } from "@/components/commerce/product/product-selects";
import { Button } from "@/components/ui/button";
import type { IBonusOfferData, IProductDetailData } from "@/generated/data";
import { cartShow } from "@/generated/routes/cart-show";
import { useAddToCart } from "@/lib/queries/cart";
import { router } from "@inertiajs/react";
import { useState } from "react";
import { toast } from "sonner";

/**
 * The add-to-bag control: quantity and the button.
 *
 * It holds no state of its own. Quantity is resolved by the URL the shopper
 * is on, so the product model already reports what would be added — the
 * button posts back exactly what the server last said.
 *
 * A master product with an unchosen variation attribute is not ready to
 * order; base disabled the same button on the same flag.
 *
 * **Product options are not offered** (Extended Warranty and its like).
 * Choosing one navigates to the option URL the platform builds, and base's
 * product factory throws resolving it — `sony-ps3-bundleM` with
 * `dwopt_..._consoleWarranty` answers a 500 before any port code runs. The
 * line is still added with the option model's default value, which is what
 * base applies when a request names no option, and the cart line still shows
 * whatever option the line carries. See the row Notes for what returning it
 * needs.
 */
export function AddToBag({
  product,
  onSelect,
}: {
  product: IProductDetailData;
  onSelect?: (variationUrl: string) => void;
}) {
  const addToCart = useAddToCart();
  // A choice-of-bonus promotion the addition just earned. It exists only in
  // the answer — nothing can ask for it afterwards but Cart-EditBonusProduct.
  const [offer, setOffer] = useState<IBonusOfferData | null>(null);
  const unavailable = !product.availability.available;
  const blocked = !product.readyToOrder || unavailable;

  return (
    <div className="flex w-full flex-col items-start gap-5 pt-2">
      <QuantitySelect product={product} onSelect={onSelect} />

      <Button
        size="lg"
        disabled={blocked || addToCart.isPending}
        className="label-caps h-13 w-full max-w-sm"
        onClick={() =>
          addToCart.mutate(
            {
              pid: product.id,
              quantity: product.selectedQuantity,
              // No options travel: with nothing to choose, every value would
              // be the option model's default, which is exactly what base
              // applies when a request names none.
            },
            {
              onSuccess: (result) => {
                toast.success(result.message || "Added to bag", {
                  action: {
                    label: "View bag",
                    onClick: () => router.visit(cartShow()),
                  },
                });
                if (result.bonusOffer) setOffer(result.bonusOffer);
              },
              onError: (error) => toast.error(error.message),
            }
          )
        }
      >
        {addToCart.isPending ? "Adding" : "Add to bag"}
      </Button>

      {blocked && (
        <span className="meta-caps text-muted-foreground">
          {unavailable ? "Out of stock" : "Choose every option to continue"}
        </span>
      )}

      <BonusChooser
        offer={offer}
        onOpenChange={(open) => {
          if (!open) setOffer(null);
        }}
      />
    </div>
  );
}
