import { RequestPasswordReset } from "@/components/commerce/account/request-password-reset";
import { Section } from "@/components/commerce/section";
import { Head } from "@inertiajs/react";

/**
 * The page carries no props of its own: the form is base's own two fields,
 * and where to go once the link is sent comes back with the answer.
 */
export default function PasswordReset() {
  return (
    <>
      <Head title="Reset password — Meridian" />

      <Section title="Reset password" titleAs="h1" className="pb-24">
        <div className="mx-auto w-full max-w-md">
          <RequestPasswordReset />
        </div>
      </Section>
    </>
  );
}
