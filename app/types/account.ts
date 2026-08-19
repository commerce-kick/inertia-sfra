import type {
  IAccountData,
  INewPasswordFormData,
  IProfileFormData,
} from "@/generated/data";
import type { SharedProps } from "./shared";

/** Props of default/Account/Show — the dashboard. */
export interface AccountShowProps extends SharedProps {
  account: IAccountData;
}

/** Props of default/Account/EditProfile — the `profile` form, prefilled. */
export interface AccountEditProfileProps extends SharedProps {
  form: IProfileFormData;
}

/**
 * Props of default/Account/SetNewPassword — rendered by both steps of the
 * reset flow. Account-SetNewPassword lands the emailed token and hands it
 * straight on (`redirecting`), which is how the token leaves the address bar;
 * Account-DoSetNewPassword renders the form the shopper actually fills in.
 */
export interface AccountSetNewPasswordProps extends SharedProps {
  token: string;
  form: INewPasswordFormData;
  redirecting?: boolean;
}
