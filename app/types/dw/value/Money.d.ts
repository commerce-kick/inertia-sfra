import Decimal = require('../util/Decimal')
import Quantity = require('./Quantity')

/**
 * Represents money in Commerce Cloud Digital.
 */
declare class Money {
    /**
     * Represents that there is no money available.
     */
    static NOT_AVAILABLE  :  Money

    /**
     * Identifies if the instance contains settings for value and currency.
     */
    readonly available  :  boolean

    /**
     * The money as Decimal, null is returned when the money is not available.
     */
    readonly decimalValue  :  Decimal | null;

    /**
     * The value of the money instance.
     */
    readonly value  :  number

    /**
     * Return the value of the money instance or null if the Money instance is NOT_AVAILABLE.
     */
    readonly valueOrNull  :  number | null

    /**
     * The ISO 4217 currency mnemonic (such as 'USD', 'EUR') of the currency the money value relates to. Note a money instance may also describe a price that is 'not available'. In this case the value of this attribute is N/A.
     */
    readonly currencyCode : string;


}

export = Money;
