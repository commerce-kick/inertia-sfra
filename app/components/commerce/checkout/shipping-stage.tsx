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
import {
  useSelectCheckoutShipping,
  useShippingMethods,
  useSubmitShipping,
} from "@/lib/queries/checkout";
import { cn } from "@/lib/utils";
import { router } from "@inertiajs/react";
import { useState } from "react";

/** One shipping method to choose between. */
function MethodOption({
  method,
  checked,
  disabled,
  onSelect,
}: {
  method: IShippingMethodData;
  checked: boolean;
  disabled?: boolean;
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
          disabled={disabled}
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
  const selectMethod = useSelectCheckoutShipping();

  const [values, setValues] = useState<Record<string, string>>({});
  const [methodId, setMethodId] = useState(
    shipment?.selectedShippingMethod?.id ?? ""
  );
  const [billSame, setBillSame] = useState(true);

  const methods = shipment?.applicableShippingMethods ?? [];

  const set = (name: string, value: string) =>
    setValues((current) => ({ ...current, [name]: value }));

  const valueOf = (field: { name: string; value: string }) =>
    values[field.name] ?? field.value;

  /**
   * The address under the field names Address-SaveAddress and
   * CheckoutShippingServices-SubmitShipping expect: the form definition's
   * own `dwfrm_` names.
   */
  const formNamedAddress = () => {
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
    for (const field of fields) payload[field.name] = valueOf(field);
    return payload;
  };

  /**
   * The same address under *plain* names.
   *
   * SelectShippingMethod and UpdateShippingMethodsList do not read the form
   * definition — they read `firstName`, `address1`, `stateCode`,
   * `countryCode`, `phone` straight off the request
   * (shippingHelpers.getAddressFromRequest) — and they write every one of
   * them onto the shipment, nulling whatever is absent. So these two calls
   * must carry the whole address in these names, or they erase it.
   */
  const plainAddress = () => {
    const form = forms.shippingAddress;
    return {
      firstName: valueOf(form.firstName),
      lastName: valueOf(form.lastName),
      address1: valueOf(form.address1),
      address2: valueOf(form.address2),
      city: valueOf(form.city),
      stateCode: valueOf(form.stateCode),
      postalCode: valueOf(form.postalCode),
      countryCode: valueOf(form.country),
      phone: valueOf(form.phone),
      ...(shipment?.uuid ? { shipmentUUID: shipment.uuid } : {}),
    };
  };

  const errors = submit.data?.fields ?? {};

  return (
    <form
      className="flex flex-col gap-8"
      onSubmit={(event) => {
        event.preventDefault();

        submit.mutate(
          {
            ...formNamedAddress(),
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
          refreshMethods.mutate(plainAddress());
        }}
      />

      <AddressFields
        form={forms.shippingAddress}
        values={values}
        errors={errors}
        onChange={set}
        onAddressChanged={() => refreshMethods.mutate(plainAddress())}
      />

      <div className="flex flex-col gap-3">
        <h3 className="label-caps">Delivery</h3>
        {methods.length === 0 ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            Fill in the address and the delivery options for it appear here.
          </p>
        ) : (
          <div
            className="flex flex-col"
            aria-busy={selectMethod.isPending || undefined}
          >
            {methods.map((method) => (
              <MethodOption
                key={method.id}
                method={method}
                checked={method.id === methodId}
                disabled={selectMethod.isPending}
                onSelect={() => {
                  setMethodId(method.id);
                  // Base applies the method as soon as it is picked, because
                  // choosing is what lets the platform price shipping and tax
                  // at all — the totals beside it move on the answer.
                  selectMethod.mutate({
                    ...plainAddress(),
                    methodID: method.id,
                  });
                }}
              />
            ))}
          </div>
        )}

        {selectMethod.isPending && (
          <p role="status" className="text-sm text-muted-foreground">
            Repricing…
          </p>
        )}
        {selectMethod.isError && (
          <p role="alert" className="text-sm text-destructive">
            {selectMethod.error.message}
          </p>
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
