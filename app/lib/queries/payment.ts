import { useSfraRequest } from "./sfra";
import type { IFormResultData, IPaymentDeletedData } from "@/generated/data";
import { paymentInstrumentsDeletePayment } from "@/generated/routes/paymentinstruments-deletepayment";
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

/**
 * Remove a card from the wallet.
 *
 * Base told its jQuery which row to delete; here the page reloads the prop it
 * just invalidated, so the list and its empty state come from the server that
 * did the deleting.
 */
export function useDeletePayment() {
  const request = useSfraRequest();

  return useMutation({
    mutationFn: (vars: { uuid: string }) =>
      request<IPaymentDeletedData>(
        paymentInstrumentsDeletePayment({ UUID: vars.uuid })
      ),
    onSuccess: () => router.reload({ only: ["cards"] }),
  });
}
