import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { ICartDiscountData } from "@/generated/data";
import { useRemoveCoupon } from "@/lib/queries/cart";
import { X } from "lucide-react";
import { toast } from "sonner";

/** Give a promo code back, behind the confirmation base asked for. */
export function RemoveCoupon({ discount }: { discount: ICartDiscountData }) {
  const remove = useRemoveCoupon();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={remove.isPending}
          aria-label={`Remove coupon ${discount.couponCode}`}
        >
          <X className="size-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="display-caps text-2xl">
            Remove coupon?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove {discount.couponCode} from your bag?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="label-caps">Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="label-caps"
            onClick={() =>
              remove.mutate(
                { uuid: discount.uuid, code: discount.couponCode },
                { onError: (error) => toast.error(error.message) }
              )
            }
          >
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
