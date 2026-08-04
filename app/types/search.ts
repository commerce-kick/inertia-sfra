import type {
  ICategoryData,
  IRefinementData,
  ISearchTileData,
  ISelectedFilterData,
  ISortOptionData,
} from "@/generated/data";
import type { ScrollPaginator, SharedProps } from "./shared";

/** The `search` prop: result meta for the current query. */
export type SearchMeta = {
  count: number;
  keywords: string;
  isCategorySearch: boolean;
  resetLink: string;
  permalink: string;
  category: ICategoryData | null;
  bannerImageUrl: string;
};

/** The `sort` prop: active rule + available options. */
export type SortState = {
  ruleId: string;
  options: ISortOptionData[];
};

/** Props of default/Search/Show. */
export interface SearchShowProps extends SharedProps {
  products: ScrollPaginator<ISearchTileData>;
  search: SearchMeta;
  refinements: IRefinementData[];
  selectedFilters: ISelectedFilterData[];
  sort: SortState;
}
