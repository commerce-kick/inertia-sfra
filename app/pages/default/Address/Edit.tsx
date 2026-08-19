import { AddressForm } from "@/components/commerce/address/address-form";
import { Section } from "@/components/commerce/section";
import type { AddressEditProps } from "@/types/address";
import { Head, usePage } from "@inertiajs/react";

export default function Edit() {
  const { form, addressId } = usePage<AddressEditProps>().props;
  const title = addressId ? "Edit address" : "New address";

  return (
    <>
      <Head title={`${title} — Meridian`} />

      <Section title={title} titleAs="h1" className="pb-24">
        <div className="mx-auto w-full max-w-md">
          <AddressForm form={form} addressId={addressId} />
        </div>
      </Section>
    </>
  );
}
