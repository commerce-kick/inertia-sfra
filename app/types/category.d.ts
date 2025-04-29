export interface TCategory {
    name:                 string;
    url:                  string;
    id:                   string;
    subCategories:        SubCategory[];
    complexSubCategories: boolean;
}

export interface TSubCategory {
    name: string;
    url:  string;
    id:   string;
}
