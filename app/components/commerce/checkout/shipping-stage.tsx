import { AddressFields } from "@/components/commerce/checkout/address-fields";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type {
  IAddressData,
  ICheckoutFormsData,
  ICheckoutOrderData,
  IShippingMethodData,
} from "@/generated/data";
import { checkoutBegin } from "@/generated/routes/checkout-begin";
import { useShippingMethods, useSubmitShipping } from "@/lib/queries/checkout";
import { cn } from "@/lib/utils";
import { router } from "@inertiajs/react";
import { useState } from "react";

/** One shipping method to choose between. */
function MethodOption({
  method,
  checked,
  onSelect,
}: {
  method: IShippingMethodData;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-baseline justify-between gap-6 border-b py-4 transition-colors duration-(--motion-fast)",
        checked ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <span className="flex items-baseline gap-3">
        <input
          type="radio"
          name="shippingMethod"
          checked={checked}
          onChange={onSelect}
          className="size-3 accent-foreground"
        />
        <span className="flex flex-col gap-1">
          <span className="label-caps">{method.displayName}</span>
          {method.estimatedArrivalTime && (
            <span className="meta-caps text-muted-foreground">
              {method.estimatedArrivalTime}
            </span>
          )}
        </span>
      </span>
      <span className="meta-caps">{method.shippingCost}</span>
    </label>
  );
}

/** Fill the form from an address the shopper already has saved. */
function SavedAddresses({
  addresses,
  onPick,
}: {
  addresses: IAddressData[];
  onPick: (address: IAddressData) => void;
}) {
  if (addresses.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <span className="label-caps text-muted-foreground">Use a saved address</span>
      <div className="flex flex-wrap gap-2">
        {addresses.map((address) => (
          <Button
            key={address.id}
            type="button"
            variant="outline"
            onClick={() => onPick(address)}
            className="label-caps h-10 px-4"
          >
            {address.id}
          </Button>
        ))}
      </div>
    </div>
  );
}

/**
 * Where the order goes, and how.
 *
 * Base submits the address and the method together, and asks the server which
 * methods an address may use as the address takes shape — what can ship to a
 * postcode is not something a browser can know. Both are kept: choosing a
 * country or state refreshes the method list, and the totals move with it,
 * because shipping cost is part of what the server just recalculated.
 */
export function ShippingStage({
  order,
  forms,
  savedAddresses,
}: {
  order: ICheckoutOrderData;
  forms: ICheckoutFormsData;
  savedAddresses: IAddressData[];
}) {
  const shipment = order.shipping[0];
  const submit = useSubmitShipping();
  const refreshMethods = useShippingMethods();

  const [values, setValues] = useState<Record<string, string>>({});
  const [methodId, setMethodId] = useState(
    shipment?.selectedShippingMethod?.id ?? ""
  );
  const [billSame, setBillSame] = useState(true);

  const methods =
    refreshMethods.data?.order?.shipping?.[0]?.applicableShippingMethods
    ?? shipment?.applicableShippingMethods
    ?? [];

  const set = (name: string, value: string) =>
    setValues((current) => ({ ...current, [name]: value }));

  const addressPayload = () => {
    const form = forms.shippingAddress;
    const fields = [
      form.firstName,
      form.lastName,
      form.address1,
      form.address2,
      form.city,
      form.postalCode,
      form.phone,
      form.country,
      form.stateCode,
    ];
    const payload: Record<string, string> = {};
    for (const field of fields) {
      payload[field.name] = values[field.name] ?? field.value;
    }
    return payload;
  };

  const errors = submit.data?.fields ?? {};

  return (
    <form
      className="flex flex-col gap-8"
      onSubmit={(event) => {
        event.preventDefault();

        submit.mutate(
          {
            ...addressPayload(),
            [forms.shippingMethodId.name]: methodId,
            ...(billSame ? { [forms.useAsBilling.name]: "true" } : {}),
          },
          {
            onSuccess: (result) => {
              if (Object.keys(result.fields).length === 0 && !result.redirectUrl) {
                router.visit(checkoutBegin({ stage: "payment" }), {
                  preserveScroll: true,
                });
              }
            },
          }
        );
      }}
    >
      <h2 className="display-caps text-2xl">Shipping address</h2>

      <SavedAddresses
        addresses={savedAddresses}
        onPick={(address) => {
          const form = forms.shippingAddress;
          setValues({
            [form.firstName.name]: address.firstName,
            [form.lastName.name]: address.lastName,
            [form.address1.name]: address.address1,
            [form.address2.name]: address.address2,
            [form.city.name]: address.city,
            [form.postalCode.name]: address.postalCode,
            [form.phone.name]: address.phone,
            [form.country.name]: address.countryCode,
            [form.stateCode.name]: address.stateCode,
          });
          refreshMethods.mutate(addressPayload());
        }}
      />

      <AddressFields
        form={forms.shippingAddress}
        values={values}
        errors={errors}
        onChange={set}
        onAddressChanged={() => refreshMethods.mutate(addressPayload())}
      />

      <div className="flex flex-col gap-3">
        <h3 className="label-caps">Delivery</h3>
        {methods.length === 0 ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            Fill in the address and the delivery options for it appear here.
          </p>
        ) : (
          <div className="flex flex-col">
            {methods.map((method) => (
              <MethodOption
                key={method.id}
                method={method}
                checked={method.id === methodId}
                onSelect={() => setMethodId(method.id)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Checkbox
          id="billSame"
          checked={billSame}
          onCheckedChange={(state) => setBillSame(state === true)}
        />
        <label htmlFor="billSame" className="label-caps">
          Bill to this address
        </label>
      </div>

      {(submit.isError || submit.data?.message) && (
        <p role="alert" className="text-sm text-destructive">
          {submit.error?.message || submit.data?.message}
        </p>
      )}

      <Button
        type="submit"
        disabled={submit.isPending || !methodId}
        className="label-caps h-12 w-fit px-8"
      >
        {submit.isPending ? "Saving" : "Continue to payment"}
      </Button>
    </form>
  );
}
