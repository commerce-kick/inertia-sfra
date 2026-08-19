import { FormField } from "@/components/commerce/account/form-field";
import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import type { IFormFieldData, IProfileFormData } from "@/generated/data";
import { accountShow } from "@/generated/routes/account-show";
import { useSaveProfile } from "@/lib/queries/account";
import { useState } from "react";

/** The six fields base's editProfileForm.isml printed, in base's order. */
const FIELDS = [
  { key: "firstName", type: "text", autoComplete: "given-name" },
  { key: "lastName", type: "text", autoComplete: "family-name" },
  { key: "phone", type: "tel", autoComplete: "tel" },
  { key: "email", type: "email", autoComplete: "email" },
  { key: "emailConfirm", type: "email", autoComplete: "email" },
  { key: "password", type: "password", autoComplete: "current-password" },
] as const;

/**
 * Edit the profile.
 *
 * The last field is the account's own password, and it is not decoration:
 * base will not move a name, a phone number or a login email without the
 * platform verifying it first. Everything above it arrives prefilled from the
 * account; the password and the email confirmation start empty, because
 * confirming is the point of them.
 */
export function EditProfileForm({ form }: { form: IProfileFormData }) {
  const save = useSaveProfile();
  const [values, setValues] = useState<Record<string, string>>({});
  const fieldErrors = save.data?.fields ?? {};

  const field = (key: (typeof FIELDS)[number]["key"]) =>
    form[key] as IFormFieldData;

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();

        const payload: Record<string, string> = {};
        for (const { key } of FIELDS) {
          const target = field(key);
          payload[target.name] = values[target.name] ?? target.value;
        }

        save.mutate(payload, {
          onSuccess: (result) => {
            const first = Object.keys(result.fields ?? {})[0];
            if (first) document.getElementById(first)?.focus();
          },
        });
      }}
    >
      {FIELDS.map(({ key, type, autoComplete }) => {
        const target = field(key);
        // The two confirmations start empty even though the profile has
        // values for them: a confirmation the browser prefills confirms
        // nothing.
        const prefilled = key !== "emailConfirm" && key !== "password";

        return (
          <FormField
            key={key}
            field={target}
            type={type}
            autoComplete={autoComplete}
            value={values[target.name] ?? (prefilled ? target.value : "")}
            error={fieldErrors[target.name]}
            onChange={(value) =>
              setValues((current) => ({ ...current, [target.name]: value }))
            }
          />
        );
      })}

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
          {save.isPending ? "Saving" : "Save"}
        </Button>
        <Button asChild variant="outline" className="label-caps h-12 px-8">
          <Link href={accountShow({})}>Back to account</Link>
        </Button>
      </div>
    </form>
  );
}
