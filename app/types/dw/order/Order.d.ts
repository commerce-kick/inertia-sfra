import LineItemCtnr = require('../order/LineItemCtnr');
import EnumValue = require('../value/EnumValue');
import FilteringCollection = require('../util/FilteringCollection');
import AppeasementItem = require('./AppeasementItem');
import Money = require('../value/Money');
import Appeasement = require('./Appeasement');
import InvoiceItem = require('./InvoiceItem');
import Invoice = require('./Invoice');
import ReturnCaseItem = require('./ReturnCaseItem');
import SourceCodeGroup = require('../campaign/SourceCodeGroup');
import ReturnCase = require('./ReturnCase');
import ReturnItem = require('./ReturnItem');
import Return = require('./Return');
import ShippingOrder = require('./ShippingOrder');
import ShippingOrderItem = require('./ShippingOrderItem');
import OrderItem = require('./OrderItem');
import Status = require('../system/Status');
import Customer = require('../customer/Customer');
import Note = require('../object/Note');
import Collection = require('../util/Collection');
import OrderPaymentInstrument = require('./OrderPaymentInstrument');
import CustomAttributes = require('../object/CustomAttributes');

declare global {
    module ICustomAttributes {
        interface Order extends CustomAttributes {
        }
    }
}

/**
 * The Order class represents an order.
 */
declare class Order extends LineItemCtnr<ICustomAttributes.Order> {
    static readonly CONFIRMATION_STATUS_CONFIRMED: 2;
    static readonly CONFIRMATION_STATUS_NOTCONFIRMED: 1;
    static readonly EXPORT_STATUS_EXPORTED: 1;
    static readonly EXPORT_STATUS_FAILED: 3;
    static readonly EXPORT_STATUS_NOTEXPORTED: 0;
    static readonly EXPORT_STATUS_READY: 2;
    static readonly ORDER_STATUS_CANCELLED: 6;
    static readonly ORDER_STATUS_COMPLETED: 5;
    static readonly ORDER_STATUS_CREATED: 0;
    static readonly ORDER_STATUS_FAILED: 8;
    static readonly ORDER_STATUS_NEW: 3;
    static readonly ORDER_STATUS_OPEN: 4;
    static readonly ORDER_STATUS_REPLACED: 7;
    static readonly PAYMENT_STATUS_NOTPAID: 0;
    static readonly PAYMENT_STATUS_PAID: 2;
    static readonly PAYMENT_STATUS_PARTPAID: 1;
    static readonly SHIPPING_STATUS_NOTSHIPPED: 0;
    static readonly SHIPPING_STATUS_PARTSHIPPED: 1;
    static readonly SHIPPING_STATUS_SHIPPED: 2;

    /**
     * The affiliate partner ID value, or null.
     */
    affiliatePartnerID: string | null;

    /**
     * The affiliate partner name value, or null.
     */
    affiliatePartnerName: string | null;

    /**
     * The collection of AppeasementItems associated with this order.
     */
    readonly appeasementItems: FilteringCollection<AppeasementItem>;

    /**
     * The collection of Appeasements associated with this order.
     */
    readonly appeasements: FilteringCollection<Appeasement>;

    /**
     * If this order was cancelled, returns the value of the cancel code or null.
     */
    cancelCode: EnumValue<number> | null;

    /**
     * If this order was cancelled, returns the text describing why the order was cancelled or null.
     */
    cancelDescription: string | null;

    /**
     * The sum of the captured amounts. The captured amounts are calculated on the fly. Associate a payment capture for an PaymentInstrument with an Invoice using Invoice.addCaptureTransaction(OrderPaymentInstrument, Money).
     */
    readonly capturedAmount: Money;

    /**
     * The confirmation status of the order.
     Possible values are CONFIRMATION_STATUS_NOTCONFIRMED and CONFIRMATION_STATUS_CONFIRMED.
     */
    confirmationStatus: EnumValue<number>;

    /**
     * The name of the user who has created the order. If an agent user has created the order, the agent user's name is returned. Otherwise "Customer" is returned.
     */
    readonly createdBy: string;

    /**
     * The current order. The current order represents the most recent order in a chain of orders. For example, if Order1 was replaced by Order2, Order2 is the current representation of the order and Order1 is the original representation of the order. If you replace Order2 with Order3, Order 3 is now the current order and Order1 is still the original representation of the order. If this order has not been replaced, this method returns this order because this order is the current order.
     */
    readonly currentOrder: Order;

    /**
     * The order number of the current order. The current order represents the most recent order in a chain of orders. For example, if Order1 was replaced by Order2, Order2 is the current representation of the order and Order1 is the original representation of the order. If you replace Order2 with Order3, Order 3 is now the current order and Order1 is still the original representation of the order. If this order has not been replaced, calling this method returns the same value as the getOrderNo() method because this order is the current order.
     */
    readonly currentOrderNo: string;

    /**
     * The ID of the locale that was in effect when the order was placed. This is the customer's locale.
     */
    readonly customerLocaleID: string;

    /**
     * The customer-specific reference information for the order, or null.
     */
    customerOrderReference: string | null;

    /**
     * A date after which an order can be exported.
     */
    exportAfter: Date;

    /**
     * The export status of the order.
     Possible values are: EXPORT_STATUS_NOTEXPORTED, EXPORT_STATUS_EXPORTED, EXPORT_STATUS_READY, and EXPORT_STATUS_FAILED.
     */
    exportStatus: EnumValue<number>;

    /**
     * The value of an external order number associated with this order, or null.
     */
    externalOrderNo: string | null;

    /**
     * The status of an external order associated with this order, or null.
     */
    externalOrderStatus: string | null;

    /**
     * The text describing the external order, or null.
     */
    externalOrderText: string | null;

    /**
     * Returns true, if the order is imported and false otherwise.
     */
    readonly imported: boolean;

    /**
     * The collection of InvoiceItems associated with this order.
     */
    readonly invoiceItems: FilteringCollection<InvoiceItem>;

    /**
     * The invoice number for this Order.
     */
    invoiceNo: string;

    /**
     * The collection of Invoices associated with this order.
     */
    readonly invoices: FilteringCollection<Invoice>;

    /**
     * The order number for this order.
     */
    readonly orderNo: string;

    /**
     * The URL safe token for this order.
     */
    readonly orderToken: string;

    /**
     * The original order associated with this order. The original order represents an order that was the first ancestor in a chain of orders. For example, if Order1 was replaced by Order2, Order2 is the current representation of the order and Order1 is the original representation of the order. If you replace Order2 with Order3, Order1 is still the original representation of the order. If this order is the first ancestor, this method returns this order.
     */
    readonly originalOrder: Order;

    /**
     * The order number of the original order associated with this order. The original order represents an order that was the first ancestor in a chain of orders. For example, if Order1 was replaced by Order2, Order2 is the current representation of the order and Order1 is the original representation of the order. If you replace Order2 with Order3, Order1 is still the original representation of the order. If this order is the first ancestor, this method returns the value of getOrderNo().
     */
    readonly originalOrderNo: string;

    /**
     * The order payment status value.
     Possible values are PAYMENT_STATUS_NOTPAID, PAYMENT_STATUS_PARTPAID or PAYMENT_STATUS_PAID.
     */
    paymentStatus: EnumValue<number>;

    /**
     * The sum of the refunded amounts. The refunded amounts are calculated on the fly. Associate a payment refund for an PaymentInstrument with an Invoice using Invoice.addRefundTransaction(OrderPaymentInstrument, Money).
     */
    readonly refundedAmount: Money;

    /**
     * The IP address of the remote host from which the order was created.

     If the IP address was not captured for the order because order IP logging was disabled at the time the order was created, null will be returned.
     */
    readonly remoteHost: string | null;

    /**
     * If this order was replaced by another order, returns the value of the replace code. Otherwise. returns null.
     */
    replaceCode: EnumValue<number> | null;

    /**
     * If this order was replaced by another order, returns the value of the replace description. Otherwise returns null.
     */
    replaceDescription: string | null;

    /**
     * The order that this order replaced or null. For example, if you have three orders where Order1 was replaced by Order2 and Order2 was replaced by Order3, calling this method on Order3 will return Order2. Similarly, calling this method on Order1 will return null as Order1 was the original order.
     */
    readonly replacedOrder: Order | null;

    /**
     * The order number that this order replaced or null if this order did not replace an order. For example, if you have three orders where Order1 was replaced by Order2 and Order2 was replaced by Order3, calling this method on Order3 will return the order number for Order2. Similarly, calling this method on Order1 will return null as Order1 was the original order.
     */
    readonly replacedOrderNo: string | null;

    /**
     * The order that replaced this order, or null.
     */
    readonly replacementOrder: Order | null;

    /**
     * If this order was replaced by another order, returns the order number that replaced this order. Otherwise returns null.
     */
    readonly replacementOrderNo: string | null;

    /**
     * The collection of ReturnCaseItems associated with this order.
     */
    readonly returnCaseItems: FilteringCollection<ReturnCaseItem>;

    /**
     * The collection of ReturnCases associated with this order.
     */
    readonly returnCases: FilteringCollection<ReturnCase>;

    /**
     * The collection of ReturnItems associated with this order.
     */
    readonly returnItems: FilteringCollection<ReturnItem>;

    /**
     * The collection of Returns associated with this order.
     */
    readonly returns: FilteringCollection<Return>;

    /**
     * The collection of ShippingOrderItems associated with this order.
     */
    readonly shippingOrderItems: FilteringCollection<ShippingOrderItem>;

    /**
     * The collection of ShippingOrders associated with this order.
     */
    readonly shippingOrders: FilteringCollection<ShippingOrder>;

    /**
     * The order shipping status.
     Possible values are SHIPPING_STATUS_NOTSHIPPED, SHIPPING_STATUS_PARTSHIPPED or SHIPPING_STATUS_SHIPPED.
     */
    shippingStatus: EnumValue<number>;

    /**
     * The source code stored with the order or null if no source code is attached to the order.
     */
    readonly sourceCode: string | null;

    /**
     * The source code group attached to the order or null if no source code group is attached to the order.
     */
    readonly sourceCodeGroup: SourceCodeGroup | null;

    /**
     * The source code group id stored with the order or null if no source code group is attached to the order.
     */
    readonly sourceCodeGroupID: string;

    /**
     * The status of the order.
     * Possible values are:
     * - ORDER_STATUS_CREATED
     * - ORDER_STATUS_NEW
     * - ORDER_STATUS_OPEN
     * - ORDER_STATUS_COMPLETED
     * - ORDER_STATUS_CANCELLED
     * - ORDER_STATUS_FAILED
     * - ORDER_STATUS_REPLACED
     */
    status: EnumValue<number>;


}


export = Order;
