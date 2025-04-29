export interface SearchSuggestionsResponse {
    product?:  SearchSuggestionsResponseProduct;
    category?: SearchSuggestionsResponseCategory;
    content?:  Content;
    recent?:   Brand;
    popular?:  Brand;
    brand?:    Brand;
    message?:  string;
}

export interface Brand {
    available: boolean;
    phrases:   any[];
}

export interface SearchSuggestionsResponseCategory {
    categories: CategoryElement[];
    available:  boolean;
}

export interface CategoryElement {
    name:       string;
    imageUrl:   string;
    url:        string;
    parentID:   string;
    parentName: string;
}

export interface Content {
    contents:  any[];
    available: boolean;
}

export interface SearchSuggestionsResponseProduct {
    available: boolean;
    phrases:   Phrase[];
    products:  ProductElement[];
}

export interface Phrase {
    exactMatch: boolean;
    value:      string;
}

export interface ProductElement {
    name:     string;
    imageUrl: string;
    url:      string;
}
