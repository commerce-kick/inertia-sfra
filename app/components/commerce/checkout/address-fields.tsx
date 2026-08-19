import { FormField } from "@/components/commerce/account/form-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IAddressFormData, IFormFieldData } from "@/generated/data";

/** The address form's own select fields — country and state. */
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

/** The seven address fields checkout asks for — base's form minus its ID. */
const FIELDS = [
  { key: "firstName", type: "text", autoComplete: "given-name" },
  { key: "lastName", type: "text", autoComplete: "family-name" },
  { key: "address1", type: "text", autoComplete: "address-line1" },
  { key: "address2", type: "text", autoComplete: "address-line2" },
  { key: "city", type: "text", autoComplete: "address-level2" },
  { key: "postalCode", type: "text", autoComplete: "postal-code" },
  { key: "phone", type: "tel", autoComplete: "tel" },
] as const;

/**
 * A postal address inside checkout.
 *
 * The same `address` form definition the address book renders (5.2), included
 * into the shipping and billing forms by the platform — so this composes the
 * same `IAddressFormData` and posts the same server-authored field names,
 * whichever of the two it is standing in for. `addressId` is not asked here:
 * an address used once at checkout is not a saved, named entry.
 */
export function AddressFields({
  form,
  values,
  errors,
  onChange,
  onAddressChanged,
}: {
  form: IAddressFormData;
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
  /** Fired when a field that changes what can ship here settles. */
  onAddressChanged?: () => void;
}) {
  const valueOf = (field: IFormFieldData) => values[field.name] ?? field.value;

  return (
    <div className="flex flex-col gap-6">
      {FIELDS.map(({ key, type, autoComplete }) => {
        const field = form[key] as IFormFieldData;
        return (
          <FormField
            key={key}
            field={field}
            type={type}
            autoComplete={autoComplete}
            value={valueOf(field)}
            error={errors[field.name]}
            onChange={(value) => onChange(field.name, value)}
          />
        );
      })}

      <div className="grid gap-6 sm:grid-cols-2">
        <SelectField
          field={form.country}
          value={valueOf(form.country)}
          error={errors[form.country.name]}
          onChange={(value) => {
            onChange(form.country.name, value);
            onAddressChanged?.();
          }}
        />
        <SelectField
          field={form.stateCode}
          value={valueOf(form.stateCode)}
          error={errors[form.stateCode.name]}
          onChange={(value) => {
            onChange(form.stateCode.name, value);
            onAddressChanged?.();
          }}
        />
      </div>
    </div>
  );
}
