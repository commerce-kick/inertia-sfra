import { FormField } from "@/components/commerce/account/form-field";
import { detectCardType } from "@/components/commerce/payment/card-type";
import { SelectField } from "@/components/commerce/account/select-field";
import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import type { ICreditCardFormData, IFormFieldData } from "@/generated/data";
import { paymentInstrumentsList } from "@/generated/routes/paymentinstruments-list";
import { useSavePayment } from "@/lib/queries/payment";
import { useState } from "react";

/**
 * Save a card.
 *
 * The card type is not asked for — it is read from the number as it is typed,
 * which is what base's script did, and posted in the hidden field base
 * posted it in. Everything the platform knows better than the browser (is
 * this number real, does this site accept this issuer, has it expired) is
 * left to the platform and comes back on the field it concerns.
 *
 * Base offered a payment-method radio group with exactly one option, Credit
 * Card; a choice of one is not a choice, so the form states it instead.
 */
export function CardForm({ form }: { form: ICreditCardFormData }) {
  const save = useSavePayment();
  const [values, setValues] = useState<Record<string, string>>({});
  const fieldErrors = save.data?.fields ?? {};

  const valueOf = (field: IFormFieldData) => values[field.name] ?? field.value;
  const set = (field: IFormFieldData, value: string) =>
    setValues((current) => ({ ...current, [field.name]: value }));

  const cardType = detectCardType(valueOf(form.cardNumber));

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();

        save.mutate(
          {
            [form.cardOwner.name]: valueOf(form.cardOwner),
            [form.cardNumber.name]: valueOf(form.cardNumber).replace(/\s/g, ""),
            [form.cardType.name]: cardType,
            [form.expirationMonth.name]: valueOf(form.expirationMonth),
            [form.expirationYear.name]: valueOf(form.expirationYear),
          },
          {
            onSuccess: (result) => {
              const first = Object.keys(result.fields ?? {})[0];
              if (first) document.getElementById(first)?.focus();
            },
          }
        );
      }}
    >
      <p className="label-caps text-muted-foreground">Credit card</p>

      <FormField
        field={form.cardOwner}
        autoComplete="cc-name"
        value={valueOf(form.cardOwner)}
        error={fieldErrors[form.cardOwner.name]}
        onChange={(value) => set(form.cardOwner, value)}
      />

      <div className="flex flex-col gap-2">
        <FormField
          field={form.cardNumber}
          autoComplete="cc-number"
          value={valueOf(form.cardNumber)}
          error={fieldErrors[form.cardNumber.name]}
          onChange={(value) => set(form.cardNumber, value)}
        />
        {cardType && (
          <span className="meta-caps text-muted-foreground" aria-live="polite">
            {cardType}
          </span>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <SelectField
          field={form.expirationMonth}
          voice="data"
          value={valueOf(form.expirationMonth)}
          error={fieldErrors[form.expirationMonth.name]}
          onChange={(value) => set(form.expirationMonth, value)}
        />
        <SelectField
          field={form.expirationYear}
          voice="data"
          value={valueOf(form.expirationYear)}
          error={fieldErrors[form.expirationYear.name]}
          onChange={(value) => set(form.expirationYear, value)}
        />
      </div>

      {save.isError && (
        <p role="alert" className="text-sm text-destructive">
          {save.error.message}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button
          type="submit"
          disabled={save.isPending}
          className="label-caps h-12 px-8"
        >
          {save.isPending ? "Saving" : "Save card"}
        </Button>
        <Button asChild variant="outline" className="label-caps h-12 px-8">
          <Link href={paymentInstrumentsList({})}>Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
