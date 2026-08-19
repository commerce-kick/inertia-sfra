import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { IFormFieldData } from "@/generated/data";

/**
 * One field of a server-declared form.
 *
 * The label, the required flag and the length/pattern constraints all come
 * from the site's form definition, so the browser enforces exactly what the
 * server will. The input type does not: the definition only knows "string",
 * and base's templates chose `password` / `tel` / `email` per field — so the
 * composing form names its fields and picks the type, as the ISML did.
 *
 * `error` is the message the last submission answered for this field, which
 * base rendered in the same place: beneath the input, keyed by field name.
 */
export function FormField({
  field,
  type = "text",
  value,
  onChange,
  error,
  autoComplete,
}: {
  field: IFormFieldData;
  type?: "text" | "email" | "tel" | "password";
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoComplete?: string;
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
      <Input
        id={field.name}
        name={field.name}
        type={type}
        value={value}
        required={field.mandatory}
        maxLength={field.maxLength}
        minLength={field.minLength}
        pattern={field.pattern}
        autoComplete={autoComplete}
        aria-required={field.mandatory || undefined}
        aria-invalid={message ? true : undefined}
        aria-describedby={message ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="h-11"
      />
      {message && (
        <span id={errorId} role="alert" className="text-sm text-destructive">
          {message}
        </span>
      )}
    </div>
  );
}

/** The boolean form of the same thing — base rendered these as a checkbox. */
export function FormCheckbox({
  field,
  checked,
  onChange,
}: {
  field: IFormFieldData;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <Checkbox
        id={field.name}
        name={field.name}
        checked={checked}
        onCheckedChange={(state) => onChange(state === true)}
      />
      <label htmlFor={field.name} className="label-caps leading-relaxed">
        {field.label}
      </label>
    </div>
  );
}
