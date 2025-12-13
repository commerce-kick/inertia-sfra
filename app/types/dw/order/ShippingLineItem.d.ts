import LineItem = require('./LineItem');
import Money = require('../value/Money');
import Collection = require('../util/Collection');
import PriceAdjustment = require('./PriceAdjustment');
import OrderItem = require('./OrderItem');
import Discount = require('../campaign/Discount');
import CustomAttributes = require('../object/CustomAttributes');

declare global {
    module ICustomAttributes {
        interface ShippingLineItem extends CustomAttributes{
        }
    }
}

declare class ShippingLineItem extends LineItem<ICustomAttributes.ShippingLineItem> {
    /**
     * Constant used to get the standard shipping line item.
     */
    static readonly STANDARD_SHIPPING_ID  :  string

    /**
     * The price of this shipping line item including tax after shipping adjustments have been applied.
     */
    readonly adjustedGrossPrice  :  Money

    /**
     * The price of this shipping line item, excluding tax after shipping adjustments have been applied.
     */
    readonly adjustedNetPrice  :  Money

    /**
     * The adjusted price of this shipping line item. If the line item container is based on net pricing, the adjusted net price is returned. If the line item container is based on gross pricing, the adjusted gross price is returned.
     */
    readonly adjustedPrice  :  Money

    /**
     * The tax of this shipping line item after shipping adjustments have been applied.
     */
    readonly adjustedTax  :  Money

    /**
     * The ID of this ShippingLineItem.
     */
    readonly ID  :  string

    /**
     * The order-item extension for this item, or null. An order-item extension will only exist for a ShippingLineItem which belongs to an Order.
     */
    readonly orderItem  :  OrderItem | null

    /**
     * The collection of shipping price adjustments that have been applied to this shipping line item.
     */
    readonly shippingPriceAdjustments  :  Collection<PriceAdjustment>

    private constructor();


}

export = ShippingLineItem;
