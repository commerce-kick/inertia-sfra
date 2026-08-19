import { FormField } from "@/components/commerce/account/form-field";
import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import type { INewPasswordFormData } from "@/generated/data";
import { loginShow } from "@/generated/routes/login-show";
import { useSaveNewPassword } from "@/lib/queries/account";
import { useState } from "react";

/**
 * Set a new password against the emailed token.
 *
 * The token is a hidden value, never a visible parameter — it arrives as a
 * prop precisely so it stays out of the address bar. The two fields carry the
 * site's own length rules, and the verdicts that only the server can reach —
 * the pair disagreeing, the password policy, the token having expired — come
 * back from the mutation: per-field under `fields`, whole-attempt as the
 * rejection above the button.
 */
export function NewPasswordForm({
  form,
  token,
}: {
  form: INewPasswordFormData;
  token: string;
}) {
  const save = useSaveNewPassword();
  const [values, setValues] = useState<Record<string, string>>({});
  const fieldErrors = save.data?.fields ?? {};

  const fields = [
    { field: form.newPassword, label: "new" },
    { field: form.newPasswordConfirm, label: "confirm" },
  ];

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();

        const payload: Record<string, string> = { token };
        for (const { field } of fields) {
          payload[field.name] = values[field.name] ?? "";
        }

        save.mutate(payload);
      }}
    >
      {fields.map(({ field, label }) => (
        <FormField
          key={label}
          field={field}
          type="password"
          autoComplete="new-password"
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
          <Link href={loginShow({})}>Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
