import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRequestPasswordReset } from "@/lib/queries/account";
import { useState } from "react";

/**
 * Ask for a reset link.
 *
 * The confirmation is deliberately non-committal — the server answers the
 * same whether or not the address has an account, so the copy says what is
 * actually true: if there is an account, the link is on its way. Saying
 * "we've emailed you" would claim more than the server checked.
 *
 * Where to go afterwards is the server's `redirectUrl` (base's `returnUrl`),
 * not a URL built here.
 */
export function RequestPasswordReset() {
  const [loginEmail, setEmail] = useState("");
  const reset = useRequestPasswordReset();
  const result = reset.data;

  if (result?.success) {
    return (
      <div className="flex flex-col gap-6">
        <h2 className="display-caps text-2xl">Check your inbox</h2>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          If {loginEmail} has an account with us, a link to set a new password
          is on its way. It expires shortly, so use it soon.
        </p>
        {result.redirectUrl && (
          <Button asChild variant="outline" className="label-caps h-12 w-fit px-8">
            <Link href={result.redirectUrl}>Back to sign in</Link>
          </Button>
        )}
      </div>
    );
  }

  const fieldError = result?.fields?.loginEmail;

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        reset.mutate({ loginEmail });
      }}
    >
      <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
        Enter the email address on your account and we will send you a link to
        set a new password.
      </p>

      <div className="flex flex-col gap-2">
        <label htmlFor="loginEmail" className="label-caps">
          Email
        </label>
        <Input
          id="loginEmail"
          name="loginEmail"
          type="email"
          value={loginEmail}
          required
          autoComplete="email"
          aria-invalid={fieldError ? true : undefined}
          aria-describedby={fieldError ? "loginEmail-error" : undefined}
          onChange={(event) => setEmail(event.target.value)}
          className="h-11"
        />
        {fieldError && (
          <span
            id="loginEmail-error"
            role="alert"
            className="text-sm text-destructive"
          >
            {fieldError}
          </span>
        )}
      </div>

      {reset.isError && (
        <p role="alert" className="text-sm text-destructive">
          {reset.error.message}
        </p>
      )}

      <Button type="submit" disabled={reset.isPending} className="label-caps h-12">
        {reset.isPending ? "Sending" : "Send reset link"}
      </Button>
    </form>
  );
}
