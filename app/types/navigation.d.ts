export interface SubCategory {
  name: string;
  url: string;
  id: string;
  subCategories?: SubCategory[];
  complexSubCategories?: boolean;
}

export interface Category {
  name: string;
  url: string;
  id: string;
  subCategories?: SubCategory[];
  complexSubCategories?: boolean;
}

export interface NavigationData {
  categories: Category[];
}
