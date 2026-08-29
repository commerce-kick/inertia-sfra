import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
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
import type { IAddressData } from "@/generated/data";
import { addressEditAddress } from "@/generated/routes/address-editaddress";
import { addressSetDefault } from "@/generated/routes/address-setdefault";
import { useDeleteAddress } from "@/lib/queries/address";
import { router } from "@inertiajs/react";

/**
 * One entry of the address book.
 *
 * Base drew a card with a × in the corner and confirmed the removal in a
 * modal; the confirmation stays, on the same `ui/alert-dialog` the bag uses,
 * and the card becomes a block of a hairline grid.
 *
 * "Make default" is a GET that changes state — base wrote it that way and the
 * route is base's — so it is a button that visits, never a prefetchable link:
 * this storefront's `Link` prefetches on hover, and a hover must not reorder
 * someone's address book.
 */
export function AddressCard({ address }: { address: IAddressData }) {
  const remove = useDeleteAddress();

  return (
    <section className="flex flex-col gap-5 bg-background p-8">
      <header className="flex items-baseline justify-between gap-4">
        <h2 className="label-caps">
          {address.id}
          {address.isDefault && (
            <span className="meta-caps ml-3 text-muted-foreground">Default</span>
          )}
        </h2>
        <Link
          href={addressEditAddress({ addressId: address.id })}
          className="link-draw label-caps text-muted-foreground transition-colors hover:text-foreground"
        >
          Edit
        </Link>
      </header>

      <div className="flex flex-col gap-1 text-sm leading-relaxed">
        <span>
          {address.firstName} {address.lastName}
        </span>
        <span>{address.address1}</span>
        {address.address2 && <span>{address.address2}</span>}
        <span>
          {address.city}, {address.stateCode} {address.postalCode}
        </span>
        {address.phone && <span>{address.phone}</span>}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {!address.isDefault && (
          <Button
            variant="outline"
            className="label-caps h-10 px-5"
            onClick={() =>
              router.visit(addressSetDefault({ addressId: address.id }))
            }
          >
            Make default
          </Button>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              disabled={remove.isPending}
              className="label-caps h-10 px-5 text-muted-foreground hover:text-destructive"
            >
              Remove
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="display-caps text-2xl">
                Remove {address.id}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This takes the address out of your book. It does not change any
                order already placed with it.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="label-caps">Keep</AlertDialogCancel>
              <AlertDialogAction
                className="label-caps"
                onClick={() =>
                  remove.mutate({
                    addressId: address.id,
                    isDefault: address.isDefault,
                  })
                }
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {remove.isError && (
        <p role="alert" className="text-sm text-destructive">
          {remove.error.message}
        </p>
      )}
    </section>
  );
}
