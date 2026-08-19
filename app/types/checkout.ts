import type {
  IAddressData,
  ICheckoutFormsData,
  ICheckoutOrderData,
  IOrderConfirmationData,
  IPaymentCardData,
} from "@/generated/data";
import type { SharedProps } from "./shared";

/** The four stages base's `stage` parameter names, in order. */
export type CheckoutStage = "customer" | "shipping" | "payment" | "placeOrder";

/** Props of default/Checkout/Begin — the whole flow, one page. */
export interface CheckoutBeginProps extends SharedProps {
  order: ICheckoutOrderData;
  stage: CheckoutStage;
  forms: ICheckoutFormsData;
  /** Whether the shopper is signed in, which is what skips the customer stage. */
  registered: boolean;
  savedAddresses: IAddressData[];
  savedCards: IPaymentCardData[];
}

/** Props of default/Order/Confirm — the order that now exists. */
export interface OrderConfirmProps extends SharedProps {
  confirmation: IOrderConfirmationData;
}
