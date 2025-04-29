export interface RecomendationsResponse {
    recs:     Rec[];
    recoUUID: string;
}

export interface Rec {
    custom_facebookenabled: string;
    custom_resolution:      null;
    custom_size:            null;
    custom_stepquantity:    string;
    custom_unit:            null;
    custom_upc:             string;
    custom_width:           null;
    id:                     string;
    image_url:              string;
    product_name:           string;
    product_url:            string;
}
