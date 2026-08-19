import {
  AccountPanel,
  PanelEmpty,
  PanelFact,
} from "@/components/commerce/account/account-panel";
import { Link } from "@/components/link";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import type { IAccountData } from "@/generated/data";
import { accountEditPassword } from "@/generated/routes/account-editpassword";
import { accountEditProfile } from "@/generated/routes/account-editprofile";
import { addressAddAddress } from "@/generated/routes/address-addaddress";
import { addressList } from "@/generated/routes/address-list";
import { paymentInstrumentsAddPayment } from "@/generated/routes/paymentinstruments-addpayment";
import { paymentInstrumentsList } from "@/generated/routes/paymentinstruments-list";

/** Who the shopper is. Base hid the phone on an externally-authenticated account. */
export function ProfilePanel({ account }: { account: IAccountData }) {
  const { profile, isExternallyAuthenticated } = account;
  const name = `${profile.firstName} ${profile.lastName}`.trim();

  return (
    <AccountPanel
      title="Profile"
      action={
        isExternallyAuthenticated
          ? undefined
          : { label: "Edit", href: accountEditProfile({}) }
      }
    >
      <dl className="flex flex-col gap-4">
        <PanelFact label="Name">{name || "—"}</PanelFact>
        <PanelFact label="Email">{profile.email}</PanelFact>
        {!isExternallyAuthenticated && (
          <PanelFact label="Phone">{profile.phone || "—"}</PanelFact>
        )}
      </dl>
    </AccountPanel>
  );
}

/**
 * The password. Base put its own `********` placeholder on the wire; the dots
 * are drawn here instead, because a fake secret is not a fact worth sending.
 */
export function PasswordPanel() {
  return (
    <AccountPanel
      title="Password"
      action={{ label: "Change", href: accountEditPassword({}) }}
    >
      <p className="meta-caps" aria-label="Password is set">
        ••••••••
      </p>
    </AccountPanel>
  );
}

/**
 * The address book's default entry, with base's two links: "View" into the
 * book itself, and "Add new" beneath it — which 5.1/5.2 made reachable.
 */
export function AddressPanel({ account }: { account: IAccountData }) {
  const address = account.preferredAddress;

  return (
    <AccountPanel
      title="Address book"
      action={
        address ? { label: "View", href: addressList({}) } : undefined
      }
    >
      {address ? (
        <div className="flex flex-col gap-1 text-sm leading-relaxed">
          {address.id && <span className="label-caps">{address.id}</span>}
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
      ) : (
        <PanelEmpty>
          No default address yet. One is saved the first time you check out.
        </PanelEmpty>
      )}
      <Link
        href={addressAddAddress({})}
        className="link-draw label-caps w-fit text-muted-foreground transition-colors hover:text-foreground"
      >
        Add new
      </Link>
    </AccountPanel>
  );
}

/**
 * The first card in the wallet — the platform never shows a storefront more.
 * Base's "View" and "Add new" links, which 5.7/5.8 made reachable.
 */
export function PaymentPanel({ account }: { account: IAccountData }) {
  const card = account.payment;

  return (
    <AccountPanel
      title="Payment"
      action={card ? { label: "View", href: paymentInstrumentsList({}) } : undefined}
    >
      {card ? (
        <dl className="flex flex-col gap-4">
          <PanelFact label={card.cardType}>
            <span className="meta-caps">{card.maskedNumber}</span>
          </PanelFact>
          <PanelFact label="Expires">
            <span className="meta-caps">
              {String(card.expirationMonth).padStart(2, "0")}/
              {card.expirationYear}
            </span>
          </PanelFact>
        </dl>
      ) : (
        <PanelEmpty>No card saved.</PanelEmpty>
      )}
      <Link
        href={paymentInstrumentsAddPayment({})}
        className="link-draw label-caps w-fit text-muted-foreground transition-colors hover:text-foreground"
      >
        Add new
      </Link>
    </AccountPanel>
  );
}

/**
 * The most recent order. Base built it with a single line item, so the one
 * photograph is the first line's — a glance, not a receipt.
 */
export function OrderPanel({ account }: { account: IAccountData }) {
  const order = account.lastOrder;

  return (
    <AccountPanel title="Most recent order">
      {order ? (
        <div className="flex gap-6">
          {order.image && (
            <div className="w-24 shrink-0 bg-muted">
              <AspectRatio ratio={4 / 5}>
                <img
                  src={order.image.url}
                  alt={order.image.alt}
                  loading="lazy"
                  className="size-full object-cover"
                />
              </AspectRatio>
            </div>
          )}
          <dl className="flex flex-col gap-4">
            <PanelFact label="Order">
              <span className="meta-caps">{order.orderNumber}</span>
            </PanelFact>
            <PanelFact label="Placed">
              <span className="meta-caps">{order.creationDate}</span>
            </PanelFact>
            <PanelFact label="Status">{order.status}</PanelFact>
            {order.shippedTo && (
              <PanelFact label="Shipped to">{order.shippedTo}</PanelFact>
            )}
            <PanelFact label={order.quantityTotal === 1 ? "1 item" : `${order.quantityTotal} items`}>
              <span className="meta-caps">{order.total}</span>
            </PanelFact>
          </dl>
        </div>
      ) : (
        <PanelEmpty>Nothing ordered yet.</PanelEmpty>
      )}
    </AccountPanel>
  );
}
