import { useSfraRequest } from "./sfra";
import type { IFormResultData } from "@/generated/data";
import { paymentInstrumentsSavePayment } from "@/generated/routes/paymentinstruments-savepayment";
import { router } from "@inertiajs/react";
import { useMutation } from "@tanstack/react-query";

/**
 * Save a card to the wallet.
 *
 * The platform is what validates it — the number, the expiry, and whether the
 * site accepts that card type at all — so the refusals come back per field
 * rather than being guessed at here. What the browser does check first is
 * only what the site's own form definition declares.
 *
 * Success carries base's destination: back to the saved cards.
 */
export function useSavePayment() {
  const request = useSfraRequest();

  return useMutation({
    mutationFn: (fields: Record<string, string>) =>
      request<IFormResultData>(paymentInstrumentsSavePayment({}), fields),
    onSuccess: (result) => {
      if (result.redirectUrl) router.visit(result.redirectUrl);
    },
  });
}
