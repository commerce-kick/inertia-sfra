import AbstractItemCtnr = require('./AbstractItemCtnr');
import Invoice = require('./Invoice');
import FilteringCollection = require('../util/FilteringCollection');
import ReturnCase = require('./ReturnCase');
import ReturnItem = require('./ReturnItem');
import EnumValue = require('../value/EnumValue');


/**
 * The Return represents a physical customer return, and contains 1..n ReturnItems. The Return is associated with one ReturnCase, and each ReturnItem is associated with one ReturnCaseItem and (via the ReturnCaseItem) a single OrderItem usually representing an Order ProductLineItem.
The ReturnItem records the quantity returned.
The Return can have one of these status values:

    - NEW - the return is new, i.e. needs to undergo a check before it can be marked as COMPLETED
    - COMPLETED - the return is complete, this is a precondition for refunding the customer for a return.

 */
declare class Return extends AbstractItemCtnr {
    /**
     * Sorting by item id. Use with method getItems() as an argument to method FilteringCollection.sort(Object).
     */
    static readonly ORDERBY_ITEMID  :  Object

    /**
     * Sorting by the position of the related oder item. Use with method getItems() as an argument to method FilteringCollection.sort(Object).
     */
    static readonly ORDERBY_ITEMPOSITION  :  Object

    /**
     * Unsorted , as it is. Use with method getItems() as an argument to method FilteringCollection.sort(Object).
     */
    static readonly ORDERBY_UNSORTED  :  Object

    /**
     * Selects the product items. Use with method getItems() as an argument to method FilteringCollection.select(Object).
     */
    static readonly QUALIFIER_PRODUCTITEMS  :  Object

    /**
     * Selects for the service items. Use with method getItems() as an argument to method FilteringCollection.select(Object).
     */
    static readonly QUALIFIER_SERVICEITEMS  :  Object

    /**
     * Constant for Return Status COMPLETED
     */
    static readonly STATUS_COMPLETED  :  string

    /**
     * Constant for Return Status NEW
     */
    static readonly STATUS_NEW  :  string

    /**
     * Returns null or the previously created Invoice.
     */
    readonly invoice  :  Invoice | null

    /**
     * Returns null or the invoice-number.
     */
    readonly invoiceNumber  :  string | null

    /**
     * The ReturnItems contained in the Return, created with method createItem(String).

    This FilteringCollection can be sorted / filtered using:

        FilteringCollection.sort(Object) with ORDERBY_ITEMID
        FilteringCollection.sort(Object) with ORDERBY_ITEMPOSITION
        FilteringCollection.sort(Object) with ORDERBY_UNSORTED
        FilteringCollection.select(Object) with QUALIFIER_PRODUCTITEMS
        FilteringCollection.select(Object) with QUALIFIER_SERVICEITEMS 


    */
    readonly items  :  FilteringCollection<ReturnItem>

    /**
     * A note for the return.
     */
    note  :  string

    /**
     * The ReturnCase with which this Return is associated. The ReturnCase may represent an RMA (return merchandise authorization).
     */
    readonly returnCase  :  ReturnCase

    /**
     * The return number identifying this return.
     */
    readonly returnNumber  :  string

    /**
     * Gets the return status.

    Possible values are STATUS_NEW, STATUS_COMPLETED.

    */
    status  :  EnumValue<string>

    private constructor();


}

export = Return;
