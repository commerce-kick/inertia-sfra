import AbstractItem = require('./AbstractItem');
import Quantity = require('../value/Quantity');
import EnumValue = require('../value/EnumValue');
import Money = require('../value/Money');
import Collection = require('../util/Collection');
import ReturnItem = require('./ReturnItem');


declare class ReturnCaseItem extends AbstractItem {
    private constructor();

    static readonly STATUS_CANCELLED  :  string
    static readonly STATUS_CONFIRMED  :  string
    static readonly STATUS_NEW  :  string
    static readonly STATUS_PARTIAL_RETURNED  :  string
    static readonly STATUS_RETURNED  :  string

    /**
     * Return the Quantity authorized for this ReturnCaseItem, may be N/A.
     */
    readonly authorizedQuantity  :  Quantity

    /**
     * Price of a single unit before discount application.
     */
    readonly basePrice  :  Money

    /**
     * Return the note for this return case item.
     */
    readonly note  :  string

    /**
     * Returns null or the parent item.
     */
    readonly parentItem  :  ReturnCaseItem | null

    /**
     * The reason code for return case item.
     */
    readonly reasonCode  :  EnumValue<string>

    /**
     * Mandatory number of ReturnCase to which this item belongs
     */
    readonly returnCaseNumber  :  string 

    /**
     * Unsorted collection of ReturnItems associated with this ReturnCaseItem.
     */
    readonly returnItems  :  Collection<ReturnCaseItem>

    /**
     * Gets the return case item status.

        The possible values are STATUS_NEW,STATUS_CONFIRMED, STATUS_PARTIAL_RETURNED, STATUS_RETURNED, STATUS_CANCELLED. 
    */
    readonly status  :  EnumValue<string>


}

export = ReturnCaseItem;

