import AbstractItemCtnr = require('./AbstractItemCtnr');
import Invoice = require('./Invoice');
import FilteringCollection = require('../util/FilteringCollection');
import Collection = require('../util/Collection');
import ReturnCaseItem = require('./ReturnCaseItem');
import EnumValue = require('../value/EnumValue');
import Return = require('./Return');


/**
 * All returns exist in the context of a ReturnCase, each Order can have any number of ReturnCases.
The ReturnCase has ReturnCaseItems, each of which is associated with an OrderItem (an extension to either a ProductLineItem or a ShippingLineItem).
Each ReturnCaseItem defines ReturnCaseItem.getAuthorizedQuantity() representing the maximum quantity expected to be returned. The ReturnCaseItem may be associated with 0..n ReturnItems - ReturnItems are added to the ReturnCaseItem when Returns are created.

Either - a ReturnCase may be used as an RMA, in which case they are created when a customer first shows a wish to return item(s). The customer then includes the RMA number with the returned item(s). The Return created as a result is then associated with the existing ReturnCase.
Or - a ReturnCase is automatically created as part of the return creation, i.e. the customer returns some item(s) leading to a creation of both a Return and an associated ReturnCase.

The scripting api allows access to the ReturnCases, whether the ReturnCase is an RMA or not, and the ReturnCase status. Both the ReturnCaseItems and any Returns associated with the ReturnCase can be accessed.

A ReturnCase has one of these status values:

    - NEW - the ReturnCase has been created and can be edited previous to its authorization
    - CONFIRMED - the ReturnCase is CONFIRMED, can no longer be edited, no Returns have been associated with it. Only a NEW- ReturnCase can be CONFIRMED
    - PARTIAL_RETURNED - the ReturnCase has been associated with at least one Return, but is not yet complete. Only a CONFIRMED- ReturnCase can be set to PARTIAL_RETURNED
    - RETURNED - the ReturnCase has been associated with Returns which match the expected authorized quantity. Only an CONFIRMED- or PARTIAL_RETURNED- return-case can be set to RETURNED
    - CANCELLED - the ReturnCase has been cancelled (only a NEW- or CONFIRMED- ReturnCase can be cancelled)

 */
declare class ReturnCase extends AbstractItemCtnr {

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
     * constant for ReturnCase Status CANCELLED
     */
    static readonly STATUS_CANCELLED  :  string

    /**
     * constant for ReturnCase Status CONFIRMED
     */
    static readonly STATUS_CONFIRMED  :  string

    /**
     * constant for ReturnCase Status NEW
     */
    static readonly STATUS_NEW  :  string

    /**
     * constant for ReturnCase Status PARTIAL RETURNED
     */
    static readonly STATUS_PARTIAL_RETURNED  :  string

    /**
     * constant for ReturnCase Status RETURNED
     */
    static readonly STATUS_RETURNED  :  string

    /**
     * Returns null or the previously created Invoice.
     */
    readonly invoice  :  Invoice  | null 

    /**
     * Returns null or the invoice-number.
     */
    readonly invoiceNumber  :  string | null 

    /**
     * Access the collection of ReturnCaseItems.

    This FilteringCollection can be sorted / filtered using:

        FilteringCollection.sort(Object) with ORDERBY_ITEMID
        FilteringCollection.sort(Object) with ORDERBY_ITEMPOSITION
        FilteringCollection.sort(Object) with ORDERBY_UNSORTED
        FilteringCollection.select(Object) with QUALIFIER_PRODUCTITEMS
        FilteringCollection.select(Object) with QUALIFIER_SERVICEITEMS 

    */
    readonly items  :  FilteringCollection<ReturnCaseItem>  

    /**
     * The mandatory return case number identifying this document.
     */
    readonly returnCaseNumber  :  string  

    /**
     * Return the collection of Returns associated with this ReturnCase.
     */
    readonly returns  :  Collection<Return>  

    /**
     * Return whether this is an RMA. This is specified when calling Order.createReturnCase(String, Boolean).
     */
    readonly RMA  :  boolean  

    /**
     * Gets the return case item status. The status of a ReturnCase is read-only and calculated from the status of the associated ReturnCaseItems.

    The possible values are STATUS_NEW,STATUS_CONFIRMED, STATUS_PARTIAL_RETURNED, STATUS_RETURNED, STATUS_CANCELLED.
    */
    readonly status  :  EnumValue<string>

    private constructor();


}

export = ReturnCase;
