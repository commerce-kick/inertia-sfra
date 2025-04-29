export interface Product {
  uuid: string;
  id: string;
  productName: string;
  productType: 'set' | 'master' | 'bundle' | 'variant';
  brand: null;
  price: Price;
  renderedPrice: string;
  images: ProductImages;
  selectedQuantity: number;
  minOrderQuantity: number;
  maxOrderQuantity: number;
  variationAttributes: VariationAttribute[];
  longDescription: string;
  shortDescription: string;
  rating: number;
  promotions: null;
  attributes: null;
  availability: Availability;
  available: boolean;
  options: any[];
  quantities?: Quantity[];
  selectedProductUrl: string;
  readyToOrder: boolean;
  online: boolean;
  pageTitle: string;
  pageDescription: string;
  pageKeywords: null;
  pageMetaTags: Raw[];
  template: null;
  giftRegistryLink: string;
  bundledProducts?: Product[];
  individualProducts?: Product[];
}


export interface Availability {
  messages: string[];
  inStockDate: null;
}

export interface ProductImages {
  large: Large[];
  small: Large[];
}

export interface Large {
  alt: string;
  url: string;
  index: string;
  title: string;
  absURL: string;
}

export interface Price {
  sales?: Price;
  list?: Price;
  formatted: string
}

export interface Price {
  value: number;
  currency: string;
  formatted: string;
  decimalPrice: string;
}

export interface Quantity {
  value: string;
  selected: boolean;
  url: string;
}

export interface VariationAttribute {
  attributeId: string;
  displayName: string;
  id: string;
  swatchable: boolean;
  displayValue: string;
  values: Value[];
  resetUrl?: string;
}

export interface Value {
  id: string;
  description: null;
  displayValue: string;
  value: string;
  selected: boolean;
  selectable: boolean;
  url: string;
  images?: ValueImages;
}

export interface ValueImages {
  swatch?: Large[];
}
