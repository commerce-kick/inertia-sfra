import { FormField } from "@/components/commerce/account/form-field";
import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import type { ICheckoutFormsData } from "@/generated/data";
import { checkoutBegin } from "@/generated/routes/checkout-begin";
import { loginShow } from "@/generated/routes/login-show";
import { useCheckoutLogin, useSubmitCustomer } from "@/lib/queries/checkout";
import { router } from "@inertiajs/react";
import { useState } from "react";

/**
 * The gate: check out as a guest, or sign in first.
 *
 * Base asks the same two things through two separate forms, and this keeps
 * them separate rather than tabbed — at this point in a purchase the shopper
 * knows which of the two they are, and hiding one behind a tab costs a click
 * to find out.
 *
 * Base also hung its OAuth buttons here with re-entry index 2 (which returns
 * to checkout). They live on the sign-in page, which this links to with the
 * same index, rather than being re-hosted here.
 */
export function CustomerStage({ forms }: { forms: ICheckoutFormsData }) {
  const guest = useSubmitCustomer();
  const login = useCheckoutLogin();
  const [values, setValues] = useState<Record<string, string>>({});

  const value = (name: string) => values[name] ?? "";
  const set = (name: string, next: string) =>
    setValues((current) => ({ ...current, [name]: next }));

  const advance = () =>
    router.visit(checkoutBegin({ stage: "shipping" }), { preserveScroll: true });

  return (
    <div className="flex flex-col gap-12">
      <form
        className="flex flex-col gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          guest.mutate(
            { [forms.guestEmail.name]: value(forms.guestEmail.name) },
            { onSuccess: (result) => !result.redirectUrl && advance() }
          );
        }}
      >
        <h2 className="display-caps text-2xl">Check out as a guest</h2>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          We use this address for the order confirmation and nothing else.
        </p>

        <FormField
          field={forms.guestEmail}
          type="email"
          autoComplete="email"
          value={value(forms.guestEmail.name)}
          error={guest.data?.fields?.[forms.guestEmail.name]}
          onChange={(next) => set(forms.guestEmail.name, next)}
        />

        {guest.isError && (
          <p role="alert" className="text-sm text-destructive">
            {guest.error.message}
          </p>
        )}

        <Button
          type="submit"
          disabled={guest.isPending}
          className="label-caps h-12 w-fit px-8"
        >
          {guest.isPending ? "Continuing" : "Continue"}
        </Button>
      </form>

      <form
        className="flex flex-col gap-6 border-t pt-10"
        onSubmit={(event) => {
          event.preventDefault();
          login.mutate({
            [forms.loginEmail.name]: value(forms.loginEmail.name),
            [forms.loginPassword.name]: value(forms.loginPassword.name),
          });
        }}
      >
        <h2 className="display-caps text-2xl">Sign in</h2>

        <FormField
          field={forms.loginEmail}
          type="email"
          autoComplete="email"
          value={value(forms.loginEmail.name)}
          error={login.data?.fields?.[forms.loginEmail.name]}
          onChange={(next) => set(forms.loginEmail.name, next)}
        />
        <FormField
          field={forms.loginPassword}
          type="password"
          autoComplete="current-password"
          value={value(forms.loginPassword.name)}
          error={login.data?.fields?.[forms.loginPassword.name]}
          onChange={(next) => set(forms.loginPassword.name, next)}
        />

        {(login.isError || login.data?.message) && (
          <p role="alert" className="text-sm text-destructive">
            {login.error?.message || login.data?.message}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-6">
          <Button
            type="submit"
            variant="outline"
            disabled={login.isPending}
            className="label-caps h-12 px-8"
          >
            {login.isPending ? "Signing in" : "Sign in"}
          </Button>
          <Link
            href={loginShow({ rurl: 2 })}
            className="link-draw label-caps text-muted-foreground transition-colors hover:text-foreground"
          >
            Other ways to sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
