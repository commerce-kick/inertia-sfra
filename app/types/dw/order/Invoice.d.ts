import AbstractItemCtnr = require('./AbstractItemCtnr');
import Money = require('../value/Money');
import Collection = require('../util/Collection');
import FilteringCollection = require('../util/FilteringCollection');
import InvoiceItem = require('./InvoiceItem');
import EnumValue = require('../value/EnumValue');
import PaymentTransaction = require('./PaymentTransaction');
import OrderPaymentInstrument = require('./OrderPaymentInstrument');

/**
 * The Invoice can be a debit or credit invoice, and is created from custom scripts using one of the methods ShippingOrder.createInvoice(string), Appeasement.createInvoice(string), ReturnCase.createInvoice(string) or Return.createInvoice(string).
 */
declare class Invoice extends AbstractItemCtnr {
    /**
     * Sorting by creation date. Use with method getPaymentTransactions() as an argument to method FilteringCollection.sort(Object).
     */
    static readonly ORDERBY_CREATION_DATE  :  Object

    /**
     * Sorting by item id. Use with method getItems() as an argument to method FilteringCollection.sort(Object).
     */
    static readonly ORDERBY_ITEMID  :  Object

    /**
     * Sorting by the position of the related oder item. Use with method getItems() as an argument to method FilteringCollection.sort(Object).
     */
    static readonly ORDERBY_ITEMPOSITION  :  Object

    /**
     * Reverse orders. Use as an argument to method FilteringCollection.sort(Object).
     */
    static readonly ORDERBY_REVERSE  :  Object

    /**
     * Unsorted , as it is. Use with method getItems() as an argument to method FilteringCollection.sort(Object).
     */
    static readonly ORDERBY_UNSORTED  :  Object

    /**
     * Selects the capture transactions. Use with method getPaymentTransactions() as an argument to method FilteringCollection.select(Object).
     */
    static readonly QUALIFIER_CAPTURE  :  Object

    /**
     * Selects the product items. Use with method getItems() as an argument to method FilteringCollection.select(Object).
     */
    static readonly QUALIFIER_PRODUCTITEMS  :  Object

    /**
     * Selects the refund transactions. Use with method getPaymentTransactions() as an argument to method FilteringCollection.select(Object).
     */
    static readonly QUALIFIER_REFUND  :  Object

    /**
     * Selects for the service items. Use with method getItems() as an argument to method FilteringCollection.select(Object).
     */
    static readonly QUALIFIER_SERVICEITEMS  :  Object

    /**
     * Constant for Invoice Status Failed.
    The invoice handling failed.
    */
    static readonly STATUS_FAILED  :  string

    /**
     * Constant for Invoice Status Manual.
    The invoice is not paid but will not be handled automatically.
    A manual invoice handling (capture or refund) is necessary.
    */
    static readonly STATUS_MANUAL  :  string

    /**
     * Constant for Invoice Status Not Paid.
    The invoice is not paid and will be handled automatically.
    */
    static readonly STATUS_NOT_PAID  :  string

    /**
     * Constant for Invoice Status Paid.
    The invoice was successfully paid.
    */
    static readonly STATUS_PAID  :  string

    /**
     * Constant for Invoice Type Appeasement.
    The invoice was created for an appeasement.
    The invoice amount needs to be refunded.
    */
    static readonly TYPE_APPEASEMENT  :  string

    /**
     * Constant for Invoice Type Return.
    The invoice was created for a return.
    The invoice amount needs to be refunded.
    */
    static readonly TYPE_RETURN  :  string

    /**
     * Constant for Invoice Type Return Case.
    The invoice was created for a return case.
    The invoice amount needs to be refunded.
    */
    static readonly TYPE_RETURN_CASE  :  string

    /**
     * Constant for Invoice Type Shipping.
    The invoice was created for a shipping order.
    The invoice amount needs to be captured.
    */
    static readonly TYPE_SHIPPING  :  string


    /**
     * The sum of the captured amounts. The captured amounts are calculated on the fly.
    Associate a payment capture for a OrderPaymentInstrument with an Invoice using addCaptureTransaction(OrderPaymentInstrument, Money).
    */
    readonly capturedAmount  :  Money

    readonly invoiceNumber  :  string
    /**
     * Access the collection of InvoiceItems.

    This FilteringCollection can be sorted / filtered using:

        FilteringCollection.sort(Object) with ORDERBY_ITEMID
        FilteringCollection.sort(Object) with ORDERBY_ITEMPOSITION
        FilteringCollection.sort(Object) with ORDERBY_UNSORTED
        FilteringCollection.select(Object) with QUALIFIER_PRODUCTITEMS
        FilteringCollection.select(Object) with QUALIFIER_SERVICEITEMS 

    paymentTransactions  :  FilteringCollection  (Read Only)
    The payment transactions belonging to this Invoice.

    This FilteringCollection can be sorted / filtered using:

        FilteringCollection.sort(Object) with ORDERBY_CREATION_DATE
        FilteringCollection.sort(Object) with ORDERBY_UNSORTED
        FilteringCollection.select(Object) with QUALIFIER_CAPTURE
        FilteringCollection.select(Object) with QUALIFIER_REFUND 

    */
    readonly items  :  FilteringCollection<InvoiceItem>

    /**
     * The sum of the refunded amounts. The refunded amounts are calculated on the fly.
    Associate a payment capture for a OrderPaymentInstrument with an Invoice using addRefundTransaction(OrderPaymentInstrument, Money).
    */
    readonly refundedAmount  :  Money

    /**
     * The invoice status.
    The possible values are STATUS_NOT_PAID, STATUS_MANUAL, STATUS_PAID, STATUS_FAILED.
    */
    status  :  EnumValue<string>

    /**
     * The invoice type.
    The possible values are TYPE_SHIPPING, TYPE_RETURN, TYPE_RETURN_CASE, TYPE_APPEASEMENT.
    */
    readonly type  :  EnumValue<string>


}

export = Invoice;
