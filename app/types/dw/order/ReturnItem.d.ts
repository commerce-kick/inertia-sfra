import AbstractItem = require('./AbstractItem');
import Quantity = require('../value/Quantity');
import Decimal = require('../util/Decimal');
import EnumValue = require('../value/EnumValue');
import Money = require('../value/Money');
import Collection = require('../util/Collection');
import ReturnCaseItem = require('./ReturnCaseItem');
import TaxGroup = require('./TaxGroup');
import TaxItem = require('./TaxItem');

/**
 * An item of a Return, created using Return.createItem(string). Represents a physically returned order line item. Please refer to the documentation of ReturnHooks for further information.
When the related Return were set to status COMPLETED, only the the custom attributes of the return item can be changed.
 */
declare class ReturnItem extends AbstractItem {
    private constructor();

    /**
     * Price of a single unit before discount application.
     */
    readonly basePrice  :  Money

    /**
     * Return the note for this return item.
     */
    readonly note  :  string

    /**
     * Returns null or the parent item.
     */
    readonly parentItem  :  ReturnItem | null

    /**
     * The reason code for return item. The list of reason codes can be updated by updating meta-data for ReturnItem.
     */
    readonly reasonCode  :  EnumValue<string>

    /**
     * The return case item related to this item. Should never return null.
     */
    readonly returnCaseItem  :  ReturnCaseItem

    /**
     * The Quantity returned. This may return an N/A quantity.
     */
    readonly returnedQuantity  :  Quantity

    /**
     * The mandatory returnNumber of the Return to which this item belongs.
     */
    readonly returnNumber  :  string


}

export = ReturnItem;
