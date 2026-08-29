import { AddressCard } from "@/components/commerce/address/address-card";
import { Section } from "@/components/commerce/section";
import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import { accountShow } from "@/generated/routes/account-show";
import { addressAddAddress } from "@/generated/routes/address-addaddress";
import type { AddressListProps } from "@/types/address";
import { Head, usePage } from "@inertiajs/react";

export default function List() {
  const { addresses } = usePage<AddressListProps>().props;

  return (
    <>
      <Head title="Address book — Meridian" />

      <Section
        title="Address book"
        titleAs="h1"
        meta={addresses.length === 1 ? "1 address" : `${addresses.length} addresses`}
        action={
          <Link href={addressAddAddress({})} className="link-draw label-caps">
            Add new
          </Link>
        }
        className="pb-24"
      >
        {addresses.length === 0 ? (
          <div className="flex flex-col items-start gap-6">
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              No saved addresses yet. Save one here and it is offered at
              checkout.
            </p>
            <Button asChild className="label-caps h-12 px-8">
              <Link href={addressAddAddress({})}>Add an address</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-px border bg-border md:grid-cols-2">
            {addresses.map((address) => (
              <AddressCard key={address.uuid || address.id} address={address} />
            ))}
          </div>
        )}

        <div className="pt-10">
          <Link
            href={accountShow({})}
            className="link-draw label-caps text-muted-foreground transition-colors hover:text-foreground"
          >
            Back to account
          </Link>
        </div>
      </Section>
    </>
  );
}
