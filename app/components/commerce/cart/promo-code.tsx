import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAddCoupon } from "@/lib/queries/cart";
import { useState } from "react";

/**
 * Redeem a promo code.
 *
 * Base put the failure under the field rather than in a banner — "already in
 * the cart", "already redeemed", "cannot be combined" are answers to what was
 * just typed, so they belong beside it. The success is quieter: the code
 * appears in the applied list below and the totals move.
 */
export function PromoCode() {
  const [code, setCode] = useState("");
  const addCoupon = useAddCoupon();

  return (
    <form
      className="flex flex-col gap-3 border-t pt-5"
      onSubmit={(event) => {
        event.preventDefault();
        const couponCode = code.trim();
        if (!couponCode) return;

        addCoupon.mutate({ couponCode }, { onSuccess: () => setCode("") });
      }}
    >
      <label htmlFor="couponCode" className="label-caps">
        Promo code
      </label>
      <div className="flex gap-2">
        <Input
          id="couponCode"
          name="couponCode"
          value={code}
          autoComplete="off"
          placeholder="Enter code"
          onChange={(event) => setCode(event.target.value)}
          aria-invalid={addCoupon.isError || undefined}
          aria-describedby={addCoupon.isError ? "couponCodeError" : undefined}
          className="label-caps h-11 flex-1"
        />
        <Button
          type="submit"
          variant="outline"
          disabled={!code.trim() || addCoupon.isPending}
          className="label-caps h-11 px-6"
        >
          Apply
        </Button>
      </div>
      {addCoupon.isError && (
        <span id="couponCodeError" role="alert" className="text-sm text-destructive">
          {addCoupon.error.message}
        </span>
      )}
    </form>
  );
}
