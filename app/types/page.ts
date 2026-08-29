import type { IContentAssetData } from "@/generated/data";
import type { SharedProps } from "./shared";

/** Props of default/Page/Show — a content asset rendered as a page. */
export interface PageShowProps extends SharedProps {
  content: IContentAssetData;
}
