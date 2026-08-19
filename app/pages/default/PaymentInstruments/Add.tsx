import { CardForm } from "@/components/commerce/payment/card-form";
import { Section } from "@/components/commerce/section";
import type { PaymentAddProps } from "@/types/payment";
import { Head, usePage } from "@inertiajs/react";

export default function Add() {
  const { form } = usePage<PaymentAddProps>().props;

  return (
    <>
      <Head title="New card — Meridian" />

      <Section title="New card" titleAs="h1" className="pb-24">
        <div className="mx-auto w-full max-w-md">
          <CardForm form={form} />
        </div>
      </Section>
    </>
  );
}
