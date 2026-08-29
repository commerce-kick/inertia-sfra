import { ChangePasswordForm } from "@/components/commerce/account/change-password-form";
import { Section } from "@/components/commerce/section";
import type { AccountEditPasswordProps } from "@/types/account";
import { Head, usePage } from "@inertiajs/react";

export default function EditPassword() {
  const { form } = usePage<AccountEditPasswordProps>().props;

  return (
    <>
      <Head title="Password — Meridian" />

      <Section title="Password" titleAs="h1" className="pb-24">
        <div className="mx-auto w-full max-w-md">
          <ChangePasswordForm form={form} />
        </div>
      </Section>
    </>
  );
}
