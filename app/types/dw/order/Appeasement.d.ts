import AbstractItemCtnr = require('./AbstractItemCtnr');
import EnumValue = require('../value/EnumValue');
import FilteringCollection = require('../util/FilteringCollection');
import Invoice = require('./Invoice');
import AppeasementItem = require('./AppeasementItem');

/**
 * The Appeasement represents a shopper request for an order credit.
Example: The buyer finds any problem with the products but he agrees to preserve them, if he would be compensated, rather than return them.

The Appeasement contains 1..n appeasement items. Each appeasement item is associated with one OrderItem usually representing an Order ProductLineItem.

An Appeasement can have one of these status values:

    - OPEN - the appeasement is open and appeasement items could be added to it
    - COMPLETED - the appeasement is complete and it is not allowed to add new items to it, this is a precondition for refunding the customer for an appeasement.

 */
declare class Appeasement extends AbstractItemCtnr {
    private constructor();
    /**
     * Sorting by item id. Use with method getItems() as an argument to method FilteringCollection.sort(Object).
     */
    static readonly ORDERBY_ITEMID  :  Object
    /**
     * Sorting by the position of the related order item. Use with method getItems() as an argument to method FilteringCollection.sort(Object).
     */
    static readonly ORDERBY_ITEMPOSITION  :  Object

    /**
     * Unsorted, as it is. Use with method getItems() as an argument to method FilteringCollection.sort(Object).
     */
    static readonly ORDERBY_UNSORTED  :  Object

    /**
     * Selects the product items. Use with method getItems() as an argument to method FilteringCollection.select(Object).
     */
    static readonly QUALIFIER_PRODUCTITEMS  :  Object

    /**
     * Selects the service items. Use with method getItems() as an argument to method FilteringCollection.select(Object).
     */
    static readonly QUALIFIER_SERVICEITEMS  :  Object

    /**
     * Constant for Appeasement Status COMPLETED
     */
    static readonly STATUS_COMPLETED  :  string

    /**
     * Constant for Appeasement Status OPEN
     */
    static readonly STATUS_OPEN  :  string

    /**
     * The appeasement number.
     */
    readonly appeasementNumber  :  string

    /**
     * Returns null or the previously created Invoice.
     */
    readonly invoice  :  Invoice  | null

    /**
     * Returns null or the invoice-number.
     */
    readonly invoiceNumber  :  string

    /**
     * A filtering collection of the appeasement items belonging to the appeasement.

    This FilteringCollection could be sorted / filtered using:

        FilteringCollection.sort(Object) with ORDERBY_ITEMID
        FilteringCollection.sort(Object) with ORDERBY_ITEMPOSITION
        FilteringCollection.sort(Object) with ORDERBY_UNSORTED
        FilteringCollection.select(Object) with QUALIFIER_PRODUCTITEMS
        FilteringCollection.select(Object) with QUALIFIER_SERVICEITEMS 
    */
    readonly items  :  FilteringCollection<AppeasementItem>

    /**
     * The reason code for the appeasement. The list of reason codes can be updated by updating meta-data for Appeasement.
     */
    reasonCode  :  EnumValue<string>

    /**
     * The reason note for the appeasement.
     */
    reasonNote  :  string

    /**
     * Gets the status of this appeasement.
    The possible values are STATUS_OPEN, STATUS_COMPLETED.
    */
    status  :  EnumValue<string>
}

export = Appeasement;
