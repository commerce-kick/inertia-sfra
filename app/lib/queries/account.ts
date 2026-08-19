import { useSfraRequest } from "./sfra";
import type { IAuthResultData } from "@/generated/data";
import { accountLogin } from "@/generated/routes/account-login";
import { router } from "@inertiajs/react";
import { useMutation } from "@tanstack/react-query";

/** The fields Account-Login accepts. */
export type LoginVars = {
  loginEmail: string;
  loginPassword: string;
  loginRememberMe?: boolean;
};

/**
 * Sign in.
 *
 * Base answers where to go next rather than letting the client decide: the
 * `rurl` index the login surface was entered with resolves server-side to
 * Account-Show or Checkout-Begin, and the answer carries the finished URL. So
 * the mutation follows it as an Inertia visit — base assigned
 * `window.location`, which is the same move with a full page load.
 *
 * A refused attempt (wrong password, locked account) arrives as an error
 * envelope and rejects, so the message lands under the form rather than in
 * a state the form has to inspect.
 *
 * @param rurl base's redirect index — 1 Account-Show, 2 Checkout-Begin
 */
export function useLogin(rurl?: number) {
  const request = useSfraRequest();

  return useMutation({
    mutationFn: (vars: LoginVars) =>
      request<IAuthResultData>(accountLogin({ rurl }), {
        ...vars,
        loginRememberMe: vars.loginRememberMe ? "true" : "",
      }),
    onSuccess: (result) => {
      if (result.redirectUrl) router.visit(result.redirectUrl);
    },
  });
}
