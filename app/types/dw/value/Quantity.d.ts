import Decimal = require('../util/Decimal');

/**
 * Represents the quantity of an item.
 */
declare class Quantity {

    /**
     * Identifies if the instance contains settings for value and unit.
     */
    readonly available  :  boolean;

    /**
     * The quantity as Decimal, null is returned when the quantity is not available
     */
    readonly decimalValue  :  Decimal | null;

    /**
     * The value for unit which identifies the unit of measure for the quantity. Examples of unit are 'inches' or 'pounds'.
     */
    readonly unit  :  string;

    /**
     * The quantity value.
     */
    readonly value  :  number;


}

export = Quantity;
