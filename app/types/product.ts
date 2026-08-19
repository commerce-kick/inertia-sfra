import type { IProductDetailData } from "@/generated/data";
import type { SharedProps } from "./shared";

/** One breadcrumb from the base SFRA product page. */
export type Crumb = {
  htmlValue: string;
  url: string;
};

/**
 * Props of default/Product/Show — answered by both PDP routes: Product-Show
 * and Product-ShowInCategory, which differ only in the breadcrumb trail.
 */
export interface ProductShowProps extends SharedProps {
  product: IProductDetailData;
  breadcrumbs: Crumb[];
}
