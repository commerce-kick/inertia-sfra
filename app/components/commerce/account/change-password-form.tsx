import { FormField } from "@/components/commerce/account/form-field";
import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import type { IPasswordChangeFormData } from "@/generated/data";
import { accountShow } from "@/generated/routes/account-show";
import { useSavePassword } from "@/lib/queries/account";
import { useState } from "react";

/**
 * Change the password while signed in.
 *
 * The current password is the authorization — this is the flow for someone
 * who knows their password and wants a different one, not the one for someone
 * who has lost it. Base tells the two possible refusals apart (a new password
 * the site's policy will not take, versus a current one that is wrong), so
 * each lands on the field it is about.
 */
export function ChangePasswordForm({ form }: { form: IPasswordChangeFormData }) {
  const save = useSavePassword();
  const [values, setValues] = useState<Record<string, string>>({});
  const fieldErrors = save.data?.fields ?? {};

  const fields = [
    { field: form.currentPassword, autoComplete: "current-password" },
    { field: form.newPassword, autoComplete: "new-password" },
    { field: form.newPasswordConfirm, autoComplete: "new-password" },
  ];

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();

        const payload: Record<string, string> = {};
        for (const { field } of fields) {
          payload[field.name] = values[field.name] ?? "";
        }

        save.mutate(payload, {
          onSuccess: (result) => {
            const first = Object.keys(result.fields ?? {})[0];
            if (first) document.getElementById(first)?.focus();
          },
        });
      }}
    >
      {fields.map(({ field, autoComplete }) => (
        <FormField
          key={field.name}
          field={field}
          type="password"
          autoComplete={autoComplete}
          value={values[field.name] ?? ""}
          error={fieldErrors[field.name]}
          onChange={(value) =>
            setValues((current) => ({ ...current, [field.name]: value }))
          }
        />
      ))}

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
          {save.isPending ? "Saving" : "Save password"}
        </Button>
        <Button asChild variant="outline" className="label-caps h-12 px-8">
          <Link href={accountShow({})}>Back to account</Link>
        </Button>
      </div>
    </form>
  );
}
