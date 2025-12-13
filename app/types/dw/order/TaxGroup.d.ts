import Decimal = require('../util/Decimal');

declare class TaxGroup {
    private constructor();


    /**
     * Gets the caption.
     */
    readonly caption  :  string

    /**
     * Gets the description.
     */
    readonly description  :  string

    /**
     * Gets the percentage amount of the rate.
     */
    readonly rate  :  number

    /**
     * Gets the tax type.
     */
    readonly taxType  :  string


}

export = TaxGroup;
