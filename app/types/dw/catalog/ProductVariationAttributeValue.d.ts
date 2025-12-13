import  MediaFile = require('../content/MediaFile')
import List = require('../util/List')

declare class ProductVariationAttributeValue {
    /**
     * The description of the product variation attribute value in the current locale.
     */
    readonly description  :  string

    /**
     * The display value for the product variation attribute value, which can be used in the user interface.
     */
    readonly displayValue  :  string

    /**
     * The ID of the product variation attribute value.
     */
    readonly ID  :  string;

    /**
     * The value for the product variation attribute value.
     */
    readonly value: string;


}

export = ProductVariationAttributeValue;
