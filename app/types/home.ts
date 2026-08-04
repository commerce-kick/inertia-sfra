import type { ISearchTileData } from "@/generated/data";
import type { SharedProps } from "./shared";

/** One entry of the `categoryShowcase` prop. */
export type CategoryShowcaseEntry = {
  id: string;
  name: string;
  url: string;
  image: { url: string; alt: string } | null;
};

/** One deferred product row of the `showcases` prop. */
export type ShowcaseRow = {
  categoryId: string;
  title: string;
  url: string;
  products: ISearchTileData[];
};

/** Props of default/Home/Show (showcases arrive deferred). */
export interface HomeShowProps extends SharedProps {
  categoryShowcase: CategoryShowcaseEntry[];
  showcases?: ShowcaseRow[];
}
