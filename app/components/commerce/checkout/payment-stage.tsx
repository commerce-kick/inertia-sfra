import { FormField } from "@/components/commerce/account/form-field";
import { AddressFields } from "@/components/commerce/checkout/address-fields";
import { detectCardType } from "@/components/commerce/payment/card-type";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  ICheckoutFormsData,
  ICheckoutOrderData,
  IFormFieldData,
  IPaymentCardData,
} from "@/generated/data";
import { checkoutBegin } from "@/generated/routes/checkout-begin";
import { useSubmitPayment } from "@/lib/queries/checkout";
import { router } from "@inertiajs/react";
import { useState } from "react";

function ExpirySelect({
  field,
  value,
  onChange,
  error,
}: {
  field: IFormFieldData;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const message = error || field.error;
  const options = field.options.filter((option) => option.value !== "");

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={field.name} className="label-caps">
        {field.label}
      </label>
      <Select value={value} onValueChange={onChange} name={field.name}>
        <SelectTrigger
          id={field.name}
          aria-invalid={message ? true : undefined}
          className="meta-caps h-11 w-full"
        >
          <SelectValue placeholder="—" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.id || option.value}
              value={option.value}
              className="meta-caps"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {message && (
        <span role="alert" className="text-sm text-destructive">
          {message}
        </span>
      )}
    </div>
  );
}

/**
 * How it is paid for: the billing address and the card.
 *
 * A shopper with saved cards may pay with one — base sends its UUID as
 * `storedPaymentUUID` and asks only for the security code, since the number
 * it already holds is a token. A new card is the full set of fields, with the
 * type read from the number exactly as the account's card form reads it (5.8).
 *
 * Everything that judges a card is the platform's: the port sends what was
 * typed and renders what comes back, per field.
 */
export function PaymentStage({
  order,
  forms,
  savedCards,
}: {
  order: ICheckoutOrderData;
  forms: ICheckoutFormsData;
  savedCards: IPaymentCardData[];
}) {
  const submit = useSubmitPayment();
  const [values, setValues] = useState<Record<string, string>>({});
  const [storedCard, setStoredCard] = useState("");
  const billingAddress = order.billing?.billingAddress;

  const errors = submit.data?.fields ?? {};
  const set = (name: string, value: string) =>
    setValues((current) => ({ ...current, [name]: value }));
  const valueOf = (field: IFormFieldData) => values[field.name] ?? field.value;

  const cardNumber = valueOf(forms.card.cardNumber);
  const cardType = detectCardType(cardNumber);

  return (
    <form
      className="flex flex-col gap-8"
      onSubmit={(event) => {
        event.preventDefault();

        const address = forms.billingAddress;
        const addressFields = [
          address.firstName,
          address.lastName,
          address.address1,
          address.address2,
          address.city,
          address.postalCode,
          address.country,
          address.stateCode,
        ];

        const payload: Record<string, string> = {
          [forms.contactPhone.name]: valueOf(forms.contactPhone),
          // The only method RefArch's checkout offers; base's own form field
          // carries it, so the name is the server's rather than written here.
          [forms.paymentMethod.name]:
            order.billing?.applicablePaymentMethods?.[0]?.id || "CREDIT_CARD",
        };
        for (const field of addressFields) {
          payload[field.name] = valueOf(field);
        }

        if (storedCard) {
          payload.storedPaymentUUID = storedCard;
          payload[forms.securityCode.name] = valueOf(forms.securityCode);
        } else {
          payload[forms.card.cardOwner.name] = valueOf(forms.card.cardOwner);
          payload[forms.card.cardNumber.name] = cardNumber.replace(/\s/g, "");
          payload[forms.card.cardType.name] = cardType;
          payload[forms.card.expirationMonth.name] = valueOf(
            forms.card.expirationMonth
          );
          payload[forms.card.expirationYear.name] = valueOf(
            forms.card.expirationYear
          );
          payload[forms.securityCode.name] = valueOf(forms.securityCode);
        }

        submit.mutate(payload, {
          onSuccess: (result) => {
            if (Object.keys(result.fields).length === 0 && !result.redirectUrl) {
              router.visit(checkoutBegin({ stage: "placeOrder" }), {
                preserveScroll: true,
              });
            }
          },
        });
      }}
    >
      <div className="flex flex-col gap-6">
        <h2 className="display-caps text-2xl">Billing address</h2>
        {billingAddress && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            Prefilled from the address this ships to. Change anything that
            differs.
          </p>
        )}
        <AddressFields
          form={forms.billingAddress}
          values={values}
          errors={errors}
          onChange={set}
        />
        <FormField
          field={forms.contactPhone}
          type="tel"
          autoComplete="tel"
          value={valueOf(forms.contactPhone)}
          error={errors[forms.contactPhone.name]}
          onChange={(value) => set(forms.contactPhone.name, value)}
        />
      </div>

      <div className="flex flex-col gap-6 border-t pt-8">
        <h2 className="display-caps text-2xl">Card</h2>

        {savedCards.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {savedCards.map((card) => (
              <Button
                key={card.uuid}
                type="button"
                variant={storedCard === card.uuid ? "default" : "outline"}
                onClick={() =>
                  setStoredCard(storedCard === card.uuid ? "" : card.uuid)
                }
                className="meta-caps h-10 px-4"
              >
                {card.maskedNumber}
              </Button>
            ))}
          </div>
        )}

        {!storedCard && (
          <>
            <FormField
              field={forms.card.cardOwner}
              autoComplete="cc-name"
              value={valueOf(forms.card.cardOwner)}
              error={errors[forms.card.cardOwner.name]}
              onChange={(value) => set(forms.card.cardOwner.name, value)}
            />
            <div className="flex flex-col gap-2">
              <FormField
                field={forms.card.cardNumber}
                autoComplete="cc-number"
                value={cardNumber}
                error={errors[forms.card.cardNumber.name]}
                onChange={(value) => set(forms.card.cardNumber.name, value)}
              />
              {cardType && (
                <span className="meta-caps text-muted-foreground" aria-live="polite">
                  {cardType}
                </span>
              )}
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <ExpirySelect
                field={forms.card.expirationMonth}
                value={valueOf(forms.card.expirationMonth)}
                error={errors[forms.card.expirationMonth.name]}
                onChange={(value) => set(forms.card.expirationMonth.name, value)}
              />
              <ExpirySelect
                field={forms.card.expirationYear}
                value={valueOf(forms.card.expirationYear)}
                error={errors[forms.card.expirationYear.name]}
                onChange={(value) => set(forms.card.expirationYear.name, value)}
              />
            </div>
          </>
        )}

        <FormField
          field={forms.securityCode}
          type="password"
          autoComplete="cc-csc"
          value={valueOf(forms.securityCode)}
          error={errors[forms.securityCode.name]}
          onChange={(value) => set(forms.securityCode.name, value)}
        />
      </div>

      {(submit.isError || submit.data?.message) && (
        <p role="alert" className="text-sm text-destructive">
          {submit.error?.message || submit.data?.message}
        </p>
      )}

      <Button
        type="submit"
        disabled={submit.isPending}
        className="label-caps h-12 w-fit px-8"
      >
        {submit.isPending ? "Saving" : "Review order"}
      </Button>
    </form>
  );
}
