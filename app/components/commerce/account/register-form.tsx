import {
  FormCheckbox,
  FormField,
} from "@/components/commerce/account/form-field";
import { Button } from "@/components/ui/button";
import type { IFormFieldData, IRegistrationFormData } from "@/generated/data";
import { useRegister } from "@/lib/queries/account";
import { useState } from "react";

/** The eight fields base's registerForm.isml printed, in base's order. */
const TEXT_FIELDS = [
  { key: "firstName", type: "text", autoComplete: "given-name" },
  { key: "lastName", type: "text", autoComplete: "family-name" },
  { key: "phone", type: "tel", autoComplete: "tel" },
  { key: "email", type: "email", autoComplete: "email" },
  { key: "emailConfirm", type: "email", autoComplete: "email" },
  { key: "password", type: "password", autoComplete: "new-password" },
  { key: "passwordConfirm", type: "password", autoComplete: "new-password" },
] as const;

/**
 * Create an account.
 *
 * Every field is the site's own declaration — label, required flag, length
 * and pattern all come down with the page — and the values go back keyed by
 * the same names, which is how base's per-field verdict finds its input
 * again. Two of those verdicts can only come from the server: the email and
 * password confirmations, and the site's password policy.
 *
 * Base put a privacy-policy line under the button with an `href="#"`; a link
 * that goes nowhere is not a feature, so the sentence stays and the dead link
 * does not.
 */
export function RegisterForm({
  form,
  rurl,
}: {
  form: IRegistrationFormData;
  rurl: number;
}) {
  const register = useRegister(rurl);
  const [values, setValues] = useState<Record<string, string>>({});
  const [subscribe, setSubscribe] = useState(false);

  const fieldErrors = register.data?.fields ?? {};
  const field = (key: (typeof TEXT_FIELDS)[number]["key"]) =>
    form[key] as IFormFieldData;

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();

        const payload: Record<string, string> = {};
        for (const { key } of TEXT_FIELDS) {
          payload[field(key).name] = values[field(key).name] ?? "";
        }
        if (form.addToEmailList?.name && subscribe) {
          payload[form.addToEmailList.name] = "true";
        }

        // Seven fields deep, a verdict that lands silently at the top of the
        // form is a verdict nobody reads: send focus to the first field the
        // server refused.
        register.mutate(payload, {
          onSuccess: (result) => {
            const first = Object.keys(result.fields ?? {})[0];
            if (first) document.getElementById(first)?.focus();
          },
        });
      }}
    >
      {TEXT_FIELDS.map(({ key, type, autoComplete }) => (
        <FormField
          key={key}
          field={field(key)}
          type={type}
          autoComplete={autoComplete}
          value={values[field(key).name] ?? field(key).value}
          error={fieldErrors[field(key).name]}
          onChange={(value) =>
            setValues((current) => ({ ...current, [field(key).name]: value }))
          }
        />
      ))}

      {form.addToEmailList && (
        <FormCheckbox
          field={form.addToEmailList}
          checked={subscribe}
          onChange={setSubscribe}
        />
      )}

      {register.isError && (
        <p role="alert" className="text-sm text-destructive">
          {register.error.message}
        </p>
      )}

      <Button
        type="submit"
        disabled={register.isPending}
        className="label-caps h-12"
      >
        {register.isPending ? "Creating account" : "Create account"}
      </Button>

      <p className="text-sm leading-relaxed text-muted-foreground">
        We use your data to process orders and, if you ask us to, to send you
        the collection notes. Nothing else.
      </p>
    </form>
  );
}
