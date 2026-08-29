import { SavedCard } from "@/components/commerce/payment/saved-card";
import { Section } from "@/components/commerce/section";
import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import { accountShow } from "@/generated/routes/account-show";
import { paymentInstrumentsAddPayment } from "@/generated/routes/paymentinstruments-addpayment";
import type { PaymentListProps } from "@/types/payment";
import { Head, usePage } from "@inertiajs/react";

export default function List() {
  const { cards } = usePage<PaymentListProps>().props;

  return (
    <>
      <Head title="Payment — Meridian" />

      <Section
        title="Payment"
        titleAs="h1"
        meta={cards.length === 1 ? "1 card" : `${cards.length} cards`}
        action={
          <Link
            href={paymentInstrumentsAddPayment({})}
            className="link-draw label-caps"
          >
            Add new
          </Link>
        }
        className="pb-24"
      >
        {cards.length === 0 ? (
          <div className="flex flex-col items-start gap-6">
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              No saved cards yet. Save one here and it is offered at checkout.
            </p>
            <Button asChild className="label-caps h-12 px-8">
              <Link href={paymentInstrumentsAddPayment({})}>Add a card</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-px border bg-border md:grid-cols-2">
            {cards.map((card) => (
              <SavedCard key={card.uuid} card={card} />
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
