import { EditProfileForm } from "@/components/commerce/account/edit-profile-form";
import { Section } from "@/components/commerce/section";
import type { AccountEditProfileProps } from "@/types/account";
import { Head, usePage } from "@inertiajs/react";

export default function EditProfile() {
  const { form } = usePage<AccountEditProfileProps>().props;

  return (
    <>
      <Head title="Profile — Meridian" />

      <Section title="Profile" titleAs="h1" className="pb-24">
        <div className="mx-auto w-full max-w-md">
          <EditProfileForm form={form} />
        </div>
      </Section>
    </>
  );
}
