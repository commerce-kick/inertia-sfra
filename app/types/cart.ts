import type { ICartData } from "@/generated/data";
import type { SharedProps } from "./shared";

/**
 * Props of default/Cart/Show. One prop: every cart mutation refreshes it
 * with `router.reload({ only: ["cart"] })`.
 */
export interface CartShowProps extends SharedProps {
  cart: ICartData;
}
