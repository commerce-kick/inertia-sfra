import type { IRegistrationFormData } from "@/generated/data";
import type { SharedProps } from "./shared";

/**
 * One external identity provider the sign-in surface offers. The URL is
 * server-authored: base builds it with `URLUtils.https`, and an OAuth flow
 * initiated over http is not the same URL.
 */
export type OAuthProvider = {
  id: string;
  label: string;
  url: string;
};

/** Props of default/Login/Show — sign in and register on one page. */
export interface LoginShowProps extends SharedProps {
  /** Which pane opens, from base's `action` parameter. */
  tab: "login" | "register";
  /** Base's redirect index, carried to both mutations: 1 Account-Show, 2 Checkout-Begin. */
  rurl: number;
  /** The remembered username, when the customer's credentials hold one. */
  login: { email: string; rememberMe: boolean };
  /** The `profile` form as the site's form definition declares it. */
  register: IRegistrationFormData;
  oauth: OAuthProvider[];
}
