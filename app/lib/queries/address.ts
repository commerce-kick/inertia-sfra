import { useSfraRequest } from "./sfra";
import type { IAddressDeletedData, IFormResultData } from "@/generated/data";
import { addressDeleteAddress } from "@/generated/routes/address-deleteaddress";
import { addressSaveAddress } from "@/generated/routes/address-saveaddress";
import { router } from "@inertiajs/react";
import { useMutation } from "@tanstack/react-query";

/**
 * Save an address — the same mutation creates and edits, as base's one route
 * does. Pass `addressId` to edit the address stored under that ID; leave it
 * out to create one under whatever ID the form's own field carries.
 *
 * The values are keyed by the server-authored field names, so nothing here
 * knows that a city is `dwfrm_address_city`. Success carries where to go
 * next, which is base's own destination: back to the book.
 */
export function useSaveAddress(addressId?: string) {
  const request = useSfraRequest();

  return useMutation({
    mutationFn: (fields: Record<string, string>) =>
      request<IFormResultData>(addressSaveAddress({ addressId }), fields),
    onSuccess: (result) => {
      if (result.redirectUrl) router.visit(result.redirectUrl);
    },
  });
}

/**
 * Remove an address from the book.
 *
 * Base told its jQuery which row to delete from the DOM; here the page
 * reloads the prop it just invalidated, which also picks up whichever address
 * inherited "default" when the removed one held it.
 */
export function useDeleteAddress() {
  const request = useSfraRequest();

  return useMutation({
    mutationFn: (vars: { addressId: string; isDefault?: boolean }) =>
      request<IAddressDeletedData>(
        addressDeleteAddress({
          addressId: vars.addressId,
          isDefault: vars.isDefault || undefined,
        })
      ),
    onSuccess: () => router.reload({ only: ["addresses"] }),
  });
}
