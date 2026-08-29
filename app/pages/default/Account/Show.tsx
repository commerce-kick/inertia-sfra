import {
  AddressPanel,
  OrderPanel,
  PasswordPanel,
  PaymentPanel,
  ProfilePanel,
} from "@/components/commerce/account/dashboard-panels";
import { Section } from "@/components/commerce/section";
import type { AccountShowProps } from "@/types/account";
import { Head, usePage } from "@inertiajs/react";

export default function Show() {
  const { account } = usePage<AccountShowProps>().props;
  const firstName = account.profile.firstName;

  return (
    <>
      <Head title="Account — Meridian" />

      <Section
        title="Account"
        titleAs="h1"
        subtitle={firstName ? `Signed in as ${firstName}.` : undefined}
        className="pb-24"
      >
        {/* A hairline grid: the rule between panels is the only thing
            separating them — no card, no ground, no border box. */}
        <div className="grid gap-px border bg-border md:grid-cols-2">
          <ProfilePanel account={account} />
          {!account.isExternallyAuthenticated && <PasswordPanel />}
          <AddressPanel account={account} />
          <PaymentPanel account={account} />
          <OrderPanel account={account} />
        </div>
      </Section>
    </>
  );
}
