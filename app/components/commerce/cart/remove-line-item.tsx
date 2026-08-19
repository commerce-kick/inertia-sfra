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
import type { ICartLineItemData } from "@/generated/data";
import { useRemoveLineItem } from "@/lib/queries/cart";
import { X } from "lucide-react";
import { toast } from "sonner";

/**
 * Remove a line, behind the confirmation base put in front of it — losing a
 * chosen product to a stray click is worth one question.
 *
 * Base's control was a bare × with the product name in its aria-label; the
 * same shape here, with the name in the dialog too so the question names what
 * it is about.
 */
export function RemoveLineItem({ item }: { item: ICartLineItemData }) {
  const remove = useRemoveLineItem();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={remove.isPending}
          aria-label={`Remove ${item.productName}`}
        >
          <X className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="display-caps text-2xl">
            Remove product?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove {item.productName} from your bag?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="label-caps">Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="label-caps"
            onClick={() =>
              remove.mutate(
                { pid: item.id, uuid: item.uuid },
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
