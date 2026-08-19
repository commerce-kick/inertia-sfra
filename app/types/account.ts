import type { INewPasswordFormData } from "@/generated/data";
import type { SharedProps } from "./shared";

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
