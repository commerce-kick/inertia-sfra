import { useSfraRequest } from "./sfra";
import type { IAuthResultData } from "@/generated/data";
import { accountLogin } from "@/generated/routes/account-login";
import { accountPasswordResetDialogForm } from "@/generated/routes/account-passwordresetdialogform";
import { accountSubmitRegistration } from "@/generated/routes/account-submitregistration";
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

/**
 * Create an account.
 *
 * The values are keyed by the form field names the server authored — the
 * register form renders each input under the `name` its `IFormFieldData`
 * carries, and hands the same map straight back, so nothing here has to know
 * that a first name is `dwfrm_profile_customer_firstname`.
 *
 * Two failure shapes, and they mean different things: a rejection is the
 * attempt as a whole failing (the account could not be created), while a
 * resolved result carrying `fields` is base's per-field verdict — the email
 * that did not match its confirmation, the password the site's policy
 * refused. The form renders those beside the inputs they name.
 *
 * @param rurl base's redirect index — 1 Account-Show, 2 Checkout-Begin
 */
export function useRegister(rurl?: number) {
  const request = useSfraRequest();

  return useMutation({
    mutationFn: (fields: Record<string, string>) =>
      request<IAuthResultData>(accountSubmitRegistration({ rurl }), fields),
    onSuccess: (result) => {
      if (result.redirectUrl) router.visit(result.redirectUrl);
    },
  });
}

/**
 * Ask for a password-reset link.
 *
 * The answer is the same whether or not an account exists at that address —
 * base is deliberately silent about it, and so is this — so a resolved
 * mutation means "if that address has an account, the link is on its way",
 * never "that address has an account". Only a malformed address comes back
 * with something to say, under `fields.loginEmail`.
 */
export function useRequestPasswordReset() {
  const request = useSfraRequest();

  return useMutation({
    mutationFn: (vars: { loginEmail: string }) =>
      request<IAuthResultData>(accountPasswordResetDialogForm({}), vars),
  });
}
