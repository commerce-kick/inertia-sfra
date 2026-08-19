import { Link } from "@/components/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { accountPasswordReset } from "@/generated/routes/account-passwordreset";
import { useLogin } from "@/lib/queries/account";
import { useState } from "react";

/**
 * Sign in with an email and a password.
 *
 * These two fields are base's own — `loginEmail` / `loginPassword`, written
 * into the ISML rather than declared in a form definition — so they carry
 * inline labels instead of server-authored ones. The email arrives prefilled
 * when the customer's credentials remember a username, which is also what
 * ticks "remember me", exactly as base did it.
 *
 * A refusal is one message for the pair, never a per-field one: the server
 * will not say which half was wrong, and inventing a guess would be a lie
 * about what was checked.
 */
export function LoginForm({
  email,
  rememberMe,
  rurl,
}: {
  email: string;
  rememberMe: boolean;
  rurl: number;
}) {
  const [loginEmail, setEmail] = useState(email);
  const [loginPassword, setPassword] = useState("");
  const [loginRememberMe, setRememberMe] = useState(rememberMe);
  const login = useLogin(rurl);

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        login.mutate({ loginEmail, loginPassword, loginRememberMe });
      }}
    >
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
          onChange={(event) => setEmail(event.target.value)}
          className="h-11"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="loginPassword" className="label-caps">
          Password
        </label>
        <Input
          id="loginPassword"
          name="loginPassword"
          type="password"
          value={loginPassword}
          required
          autoComplete="current-password"
          onChange={(event) => setPassword(event.target.value)}
          className="h-11"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Checkbox
            id="loginRememberMe"
            name="loginRememberMe"
            checked={loginRememberMe}
            onCheckedChange={(state) => setRememberMe(state === true)}
          />
          <label htmlFor="loginRememberMe" className="label-caps">
            Remember me
          </label>
        </div>
        <Link
          href={accountPasswordReset({})}
          className="link-draw label-caps text-muted-foreground transition-colors hover:text-foreground"
        >
          Forgot password?
        </Link>
      </div>

      {login.isError && (
        <p role="alert" className="text-sm text-destructive">
          {login.error.message}
        </p>
      )}

      <Button
        type="submit"
        disabled={login.isPending}
        className="label-caps h-12"
      >
        {login.isPending ? "Signing in" : "Sign in"}
      </Button>
    </form>
  );
}
