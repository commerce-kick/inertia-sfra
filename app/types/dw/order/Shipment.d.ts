import ExtensibleObject = require('../object/ExtensibleObject');
import Money = require('../value/Money');
import Collection = require('../util/Collection');
import EnumValue = require('../value/EnumValue');
import LineItem = require('./LineItem');
import ProductLineItem = require('./ProductLineItem');
import OrderAddress = require('./OrderAddress');
import ShippingMethod = require('./ShippingMethod');
import PriceAdjustment = require('./PriceAdjustment');
import ShippingLineItem = require('./ShippingLineItem');
import GiftCertificateLineItem = require('./GiftCertificateLineItem');
import CustomAttributes = require('../object/CustomAttributes');

declare global {
    module ICustomAttributes {
        interface Shipment extends CustomAttributes{
        }
    }
}

declare class Shipment extends ExtensibleObject<ICustomAttributes.Shipment> {
    /**
     * Shipment shipping status representing 'Not shipped'.
     */
    static readonly SHIPPING_STATUS_NOTSHIPPED  :  number

    /**
     * Shipment shipping status representing 'Shipped'.
     */
    static readonly SHIPPING_STATUS_SHIPPED  :  number


    /**
     * The adjusted total gross price, including tax, in the purchase currency. Adjusted merchandize prices represent the sum of product prices before services such as shipping have been added, but after adjustments from i.e. promotions have been added.
     */
    readonly adjustedMerchandizeTotalGrossPrice  :  Money

    /**
     * The adjusted net price, excluding tax, in the purchase currency. Adjusted merchandize prices represent the sum of product prices before services such as shipping have been added, but after adjustments from i.e. promotions have been added.
     */
    readonly adjustedMerchandizeTotalNetPrice  :  Money

    /**
     * The merchandize total price after all product discounts. If the line item container is based on net pricing the adjusted merchandize total net price is returned. If the line item container is based on gross pricing the adjusted merchandize total gross price is returned.
     */
    readonly adjustedMerchandizeTotalPrice  :  Money

    /**
     * The total tax in purchase currency. Adjusted merchandize prices represent the sum of product prices before services such as shipping have been added, but after adjustments from i.e. promotions have been added.
     */
    readonly adjustedMerchandizeTotalTax  :  Money

    /**
     * The adjusted sum of all shipping line items of the shipment, including tax after shipping adjustments have been applied.
     */
    readonly adjustedShippingTotalGrossPrice  :  Money

    /**
     * The sum of all shipping line items of the shipment, excluding tax after shipping adjustments have been applied.
     */
    readonly adjustedShippingTotalNetPrice  :  Money


    /**
     * The adjusted shipping total price. If the line item container is based on net pricing the adjusted shipping total net price is returned. If the line item container is based on gross pricing the adjusted shipping total gross price is returned.
     */
    readonly adjustedShippingTotalPrice  :  Money

    /**
     * The tax of all shipping line items of the shipment after shipping adjustments have been applied.
     */
    readonly adjustedShippingTotalTax  :  Money

    /**
     * All line items related to the shipment.

    The returned collection may include line items of the following types:

        - ProductLineItem
        - ShippingLineItem
        - GiftCertificateLineItem
        - PriceAdjustment

    Their common type is LineItem.

    Each ProductLineItem in the collection may itself contain bundled or option product line items, as well as a product-level shipping line item.
    */
    readonly allLineItems  :  Collection<LineItem<any>>

    /**
     * Return true if this shipment is the default shipment.
     */
    readonly default  :  boolean

    /**
     * Returns true if this line item represents a gift, false otherwise.
     */
    gift  :  boolean

    /**
     * All gift certificate line items of the shipment.
     */
    readonly giftCertificateLineItems  :  Collection<GiftCertificateLineItem>

    /**
     * The value set for gift message or null if no value set.
     */
    giftMessage  :  string | null

    /**
     * The ID of this shipment.
     */
    readonly ID  :  string

    /**
     * The total gross price, including tax, in the purchase currency. Merchandize total prices represent the sum of product prices before services such as shipping or adjustments from i.e. promotions have been added.
     */
    readonly merchandizeTotalGrossPrice  :  Money

    /**
     * The net price, excluding tax, in the purchase currency. Merchandize total prices represent the sum of product prices before services such as shipping or adjustments from i.e. promotions have been added.
     */
    readonly merchandizeTotalNetPrice  :  Money

    /**
     * The merchandize total price. If the line item container is based on net pricing the merchandize total net price is returned. If the line item container is based on gross pricing the merchandize total gross price is returned.
     */
    readonly merchandizeTotalPrice  :  Money

    /**
     * The total tax in purchase currency. Merchandize total prices represent the sum of product prices before services such as shipping or adjustments from i.e. promotions have been added.
     */
    readonly merchandizeTotalTax  :  Money

    /**
     * A collection of all product line items related to this shipment.
     */
    readonly productLineItems  :  Collection<ProductLineItem>

    /**
     * The merchandise total price of the shipment after considering all product price adjustments and prorating all Buy-X-Get-Y and order-level discounts, according to the scheme described in PriceAdjustment.getProratedPrices(). For net pricing the net price is returned. For gross pricing, the gross price is returned.
     */
    readonly proratedMerchandizeTotalPrice  :  Money

    /**
     * The shipment number for this shipment. This number is automatically generated.
     */
    readonly shipmentNo  :  string

    /**
     * The shipping address or null if none is set.
     */
    readonly shippingAddress  :  OrderAddress | null

    /**
     * A collection of all shipping line items of the shipment, excluding any product-level shipping costs that are associated with ProductLineItems of the shipment.
     */
    readonly shippingLineItems  :  Collection<ShippingLineItem>

    /**
     * The shipping method or null if none is set.
     */
    shippingMethod  :  ShippingMethod | null

    /**
     * The shipping method ID or null if none is set.
     */
    readonly shippingMethodID  :  string

    /**
     * A collection of price adjustments that have been applied to the shipping costs of the shipment, for example by the promotions engine.
    Note that this method returns all shipping price adjustments in this shipment regardless of which shipping line item they belong to. Use ShippingLineItem.getShippingPriceAdjustments() to retrieve the shipping price adjustments associated with a specific shipping line item.
    */
    readonly shippingPriceAdjustments  :  Collection<PriceAdjustment>

    /**
     * The shipping status. Possible values are SHIPMENT_NOTSHIPPED or SHIPMENT_SHIPPED.
     */
    shippingStatus  :  EnumValue<number>

    /**
     * The sum of all shipping line items of the shipment, including tax before shipping adjustments have been applied.
     */
    readonly shippingTotalGrossPrice  :  Money

    /**
     * The sum of all shipping line items of the shipment, excluding tax before shipping adjustments have been applied.
     */
    readonly shippingTotalNetPrice  :  Money

    /**
     * The shipping total price. If the line item container is based on net pricing the shipping total net price is returned. If the line item container is based on gross pricing the shipping total gross price is returned.
     */
    readonly shippingTotalPrice  :  Money

    /**
     * The tax of all shipping line items of the shipment before shipping adjustments have been applied.
     */
    readonly shippingTotalTax  :  Money

    /**
     * Convenenience method. Same as getShippingLineItem(ShippingLineItem.STANDARD_SHIPPING_ID)
     */
    readonly standardShippingLineItem  :  ShippingLineItem

    /**
     * The grand total price gross of tax for the shipment, in purchase currency. Total prices represent the sum of product prices, services prices and adjustments.
     */
    readonly totalGrossPrice  :  Money

    /**
     * The grand total price for the shipment net of tax, in purchase currency. Total prices represent the sum of product prices, services prices and adjustments.
     */
    readonly totalNetPrice  :  Money

    /**
     * The total tax for the shipment, in purchase currency. Total prices represent the sum of product prices, services prices and adjustments.
     */
    readonly totalTax  :  Money

    /**
     * The tracking number of this shipment.
     */
    trackingNumber  :  string


    private constructor();


}

export = Shipment;
