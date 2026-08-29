import type { IAddressData, IAddressFormData } from "@/generated/data";
import type { SharedProps } from "./shared";

/** Props of default/Address/List — the address book. */
export interface AddressListProps extends SharedProps {
  addresses: IAddressData[];
}

/**
 * Props of default/Address/Edit — rendered by both Address-AddAddress and
 * Address-EditAddress, which differ only in whether an address is being
 * edited. `addressId` is which one; the form's own `addressId` field is what
 * the shopper may rename it to.
 */
export interface AddressEditProps extends SharedProps {
  form: IAddressFormData;
  addressId: string;
}
