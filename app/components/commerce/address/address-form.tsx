import { FormField } from "@/components/commerce/account/form-field";
import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IAddressFormData, IFormFieldData } from "@/generated/data";
import { addressList } from "@/generated/routes/address-list";
import { useSaveAddress } from "@/lib/queries/address";
import { useState } from "react";

/** The two fields whose choices the merchant owns rather than the shopper. */
function SelectField({
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
  const errorId = `${field.name}-error`;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={field.name} className="label-caps">
        {field.label}
        {field.mandatory && (
          <span className="text-muted-foreground" aria-hidden>
            {" *"}
          </span>
        )}
      </label>
      <Select value={value} onValueChange={onChange} name={field.name}>
        <SelectTrigger
          id={field.name}
          aria-invalid={message ? true : undefined}
          aria-describedby={message ? errorId : undefined}
          className="label-caps h-11 w-full"
        >
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          {field.options.map((option) => (
            <SelectItem
              key={option.id || option.value}
              value={option.value}
              className="label-caps"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {message && (
        <span id={errorId} role="alert" className="text-sm text-destructive">
          {message}
        </span>
      )}
    </div>
  );
}

/** The eight free-text fields, in the order base's addressForm.isml printed them. */
const TEXT_FIELDS = [
  { key: "addressId", type: "text", autoComplete: "off" },
  { key: "firstName", type: "text", autoComplete: "given-name" },
  { key: "lastName", type: "text", autoComplete: "family-name" },
  { key: "address1", type: "text", autoComplete: "address-line1" },
  { key: "address2", type: "text", autoComplete: "address-line2" },
  { key: "city", type: "text", autoComplete: "address-level2" },
  { key: "postalCode", type: "text", autoComplete: "postal-code" },
  { key: "phone", type: "tel", autoComplete: "tel" },
] as const;

/**
 * Add or edit an address — one form for both, as base had one template.
 *
 * The country and state lists come down with the page from the site's own
 * form definition, so the storefront never carries a copy of them. The first
 * field is the shopper's label for the address; on an edit it is prefilled and
 * changing it renames the entry, which is exactly what base's route supports.
 */
export function AddressForm({
  form,
  addressId,
}: {
  form: IAddressFormData;
  addressId: string;
}) {
  const save = useSaveAddress(addressId || undefined);
  const [values, setValues] = useState<Record<string, string>>({});
  const fieldErrors = save.data?.fields ?? {};

  const valueOf = (field: IFormFieldData) => values[field.name] ?? field.value;
  const set = (field: IFormFieldData, value: string) =>
    setValues((current) => ({ ...current, [field.name]: value }));

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();

        const fields = [
          ...TEXT_FIELDS.map(({ key }) => form[key] as IFormFieldData),
          form.country,
          form.stateCode,
        ];
        const payload: Record<string, string> = {};
        for (const field of fields) payload[field.name] = valueOf(field);

        save.mutate(payload, {
          onSuccess: (result) => {
            const first = Object.keys(result.fields ?? {})[0];
            if (first) document.getElementById(first)?.focus();
          },
        });
      }}
    >
      {TEXT_FIELDS.map(({ key, type, autoComplete }) => {
        const field = form[key] as IFormFieldData;
        return (
          <FormField
            key={key}
            field={field}
            type={type}
            autoComplete={autoComplete}
            value={valueOf(field)}
            error={fieldErrors[field.name]}
            onChange={(value) => set(field, value)}
          />
        );
      })}

      <div className="grid gap-6 sm:grid-cols-2">
        <SelectField
          field={form.country}
          value={valueOf(form.country)}
          error={fieldErrors[form.country.name]}
          onChange={(value) => set(form.country, value)}
        />
        <SelectField
          field={form.stateCode}
          value={valueOf(form.stateCode)}
          error={fieldErrors[form.stateCode.name]}
          onChange={(value) => set(form.stateCode, value)}
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
          {save.isPending ? "Saving" : "Save address"}
        </Button>
        <Button asChild variant="outline" className="label-caps h-12 px-8">
          <Link href={addressList({})}>Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
