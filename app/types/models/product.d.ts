import { ProductSearchHit } from "@/types/dw/catalog";
import { Money } from "@/types/dw/value";

export interface IProductTile extends ProductSearchHit {
  uuid: string;
  id: string;
  productName: string;
  productType: ProductSearchHit["hitType"];
  brand: string;
  price?: {
    sales: Money;
    list?: Money;
  };
  images?: {
    small: ProductImage;
    large: ProductImage;
    [x: typeof string]: ProductImage;
  };
  rating: number;
}

export interface IProductImage {
  alt: string;
  url: string;
  title: string;
  index: string;
  absURL: string;
}
