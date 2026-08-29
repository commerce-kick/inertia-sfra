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
import type { IPaymentCardData } from "@/generated/data";
import { useDeletePayment } from "@/lib/queries/payment";

/**
 * One card in the wallet.
 *
 * Everything shown is what the platform lets a storefront see: a masked
 * number, a type, an expiry — mono, because all three are data. Base drew the
 * issuer's brand mark beside them; this world has no second colour to draw it
 * in, so the issuer is named.
 */
export function SavedCard({ card }: { card: IPaymentCardData }) {
  const remove = useDeletePayment();

  return (
    <section className="flex flex-col gap-5 bg-background p-8">
      <header className="flex items-baseline justify-between gap-4">
        <h2 className="label-caps">{card.holder || card.cardType}</h2>
        <span className="meta-caps text-muted-foreground">{card.cardType}</span>
      </header>

      <dl className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-6">
          <dt className="label-caps text-muted-foreground">Number</dt>
          <dd className="meta-caps">{card.maskedNumber}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-6">
          <dt className="label-caps text-muted-foreground">Expires</dt>
          <dd className="meta-caps">
            {String(card.expirationMonth).padStart(2, "0")}/
            {card.expirationYear}
          </dd>
        </div>
      </dl>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            disabled={remove.isPending}
            className="label-caps h-10 w-fit px-5 text-muted-foreground hover:text-destructive"
          >
            Remove
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="display-caps text-2xl">
              Remove this card?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {card.maskedNumber} comes out of your wallet. Orders already
              placed with it are unaffected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="label-caps">Keep</AlertDialogCancel>
            <AlertDialogAction
              className="label-caps"
              onClick={() => remove.mutate({ uuid: card.uuid })}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {remove.isError && (
        <p role="alert" className="text-sm text-destructive">
          {remove.error.message}
        </p>
      )}
    </section>
  );
}
