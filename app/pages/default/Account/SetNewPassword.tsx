import { NewPasswordForm } from "@/components/commerce/account/new-password-form";
import { TokenHandoff } from "@/components/commerce/account/token-handoff";
import { Section } from "@/components/commerce/section";
import type { AccountSetNewPasswordProps } from "@/types/account";
import { Head, usePage } from "@inertiajs/react";

export default function SetNewPassword() {
  const { token, form, redirecting } = usePage<AccountSetNewPasswordProps>().props;

  return (
    <>
      <Head title="New password — Meridian" />

      <Section title="New password" titleAs="h1" className="pb-24">
        <div className="mx-auto w-full max-w-md">
          {redirecting ? (
            <TokenHandoff token={token} />
          ) : (
            <NewPasswordForm form={form} token={token} />
          )}
        </div>
      </Section>
    </>
  );
}
