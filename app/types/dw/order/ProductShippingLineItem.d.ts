import LineItem = require('./LineItem');
import Money = require('../value/Money');
import Collection = require('../util/Collection');
import Quantity = require('../value/Quantity');
import Shipment = require('./Shipment');
import ProductLineItem = require('./ProductLineItem');
import PriceAdjustment = require('./PriceAdjustment');
import CustomAttributes = require('../object/CustomAttributes');

declare global {
    module ICustomAttributes {
        interface ProductShippingLineItem extends CustomAttributes{
        }
    }
}
declare class ProductShippingLineItem extends LineItem<ICustomAttributes.ProductShippingLineItem> {
    /**
     * The gross price of the product shipping line item after applying all product-shipping-level adjustments.
     */
    readonly adjustedGrossPrice  :  Money

    /**
     * The net price of the product shipping line item after applying all product-shipping-level adjustments.
     */
    readonly adjustedNetPrice  :  Money

    /**
     * The price of the product shipping line item after applying all pproduct-shipping-level adjustments. For net pricing the adjusted net price is returned (see getAdjustedNetPrice()). For gross pricing, the adjusted gross price is returned (see getAdjustedGrossPrice()).
     */
    readonly adjustedPrice  :  Money

    /**
     * The tax of the unit after applying adjustments, in the purchase currency.
     */
    readonly adjustedTax  :  Money

    /**
     * An iterator of price adjustments that have been applied to this product shipping line item.
     */
    readonly priceAdjustments  :  Collection<PriceAdjustment>

    /**
     * The parent product line item this shipping line item belongs to.
     */
    readonly productLineItem  :  ProductLineItem

    /**
     * The quantity of the shipping cost.
     */
    quantity  :  Quantity

    /**
     * The shipment this shipping line item belongs to.
     */
    readonly shipment  :  Shipment

    /**
     * The 'surcharge' flag.
     */
    surcharge  :  boolean

    private constructor();


}

export = ProductShippingLineItem;
