import type { IProductDetailData } from "@/generated/data";
import type { SharedProps } from "./shared";

/** One breadcrumb from the base SFRA product page. */
export type Crumb = {
  htmlValue: string;
  url: string;
};

/** Props of default/Product/Show. */
export interface ProductShowProps extends SharedProps {
  product: IProductDetailData;
  breadcrumbs: Crumb[];
}
