import type { ICreditCardFormData, IPaymentCardData } from "@/generated/data";
import type { SharedProps } from "./shared";

/** Props of default/PaymentInstruments/List — the wallet. */
export interface PaymentListProps extends SharedProps {
  cards: IPaymentCardData[];
}

/** Props of default/PaymentInstruments/Add — the `creditCard` form. */
export interface PaymentAddProps extends SharedProps {
  form: ICreditCardFormData;
}
