import LineItem = require('./LineItem');
import Money = require('../value/Money');
import BonusDiscountLineItem = require('./BonusDiscountLineItem');
import Quantity = require('../value/Quantity');
import Category = require('../catalog/Category');
import Collection = require('../util/Collection');
import Map = require('../util/Map');
import ProductOptionModel = require('../catalog/ProductOptionModel');
import OrderItem = require('./OrderItem');
import PriceAdjustment = require('./PriceAdjustment');
import ProductInventoryList = require('../catalog/ProductInventoryList');
import ProductListItem = require('../customer/ProductListItem');
import Shipment = require('./Shipment');
import ProductShippingLineItem = require('./ProductShippingLineItem');
import Discount = require('../campaign/Discount');
import Product = require('../catalog/Product');
import ProductOptionValue = require('../catalog/ProductOptionValue');
import CustomAttributes = require('../object/CustomAttributes');

declare global {
    module ICustomAttributes {
        interface ProductLineItem extends CustomAttributes{
        }
    }
}
/**
 * Represents a specific product line item.
 */
declare class ProductLineItem extends LineItem<ICustomAttributes.ProductLineItem> {
    private constructor();

    /**
     * The gross price of the product line item after applying all product-level adjustments.
     */
    readonly adjustedGrossPrice : Money;

    /**
     * The net price of the product line item after applying all product-level adjustments.
     */
    readonly adjustedNetPrice : Money;

    /**
     * The price of the product line item after applying all product-level adjustments. For net pricing the adjusted net price is returned (see getAdjustedNetPrice()). For gross pricing, the adjusted gross price is returned (see getAdjustedGrossPrice()).
     */
    readonly adjustedPrice : Money;

    /**
     * The tax of the unit after applying adjustments, in the purchase currency.
     */
    readonly adjustedTax : Money;

    /**
     * The parent bonus discount line item of this line item. Only bonus product line items that have been selected by the customer as part of a BONUS_CHOICE discount have one of these.
     */
    readonly bonusDiscountLineItem : BonusDiscountLineItem

    /**
     * Identifies if the product line item represents a bonus line item.
     */
    readonly bonusProductLineItem : boolean

    /**
     * Identifies if the product line item represents a bundled line item.
     */
    readonly bundledProductLineItem : boolean

    /**
     * A collection containing the bundled product line items.
     */
    readonly bundledProductLineItems : Collection<ProductLineItem>

    /**
     * Returns true if the product line items represents a catalog product.
     */
    readonly catalogProduct : boolean

    /**
     * The category the product line item is associated with. If the line item is not associated with a category, or the category does not exist in the site catalog, the method returns null.
     */
    readonly category : Category | null

    /**
     * The ID of the category the product line item is associated with.
     */
    readonly categoryID : string

    /**
     * The value set for the external line item status or null if no value set.
     */
    readonly externalLineItemStatus : string | null

    /**
     * The value set for the external line item text or null if no value set.
     */
    readonly externalLineItemText : string | null

    /**
     * Returns true if this line item represents a gift, false otherwise.
     */
    readonly gift : boolean

    /**
     * The value set for gift message or null if no value set.
     */
    readonly giftMessage : string | null

    /**
     * The name of the manfacturer of the product.
     */
    readonly manufacturerName : string

    /**
     * The name of the manfacturer's SKU of this product line item.
     */
    readonly manufacturerSKU : string

    /**
     * The minimal order quantity allowed for the product represented by the ProductLineItem (copied from product on initialization). Note: the quantity of a ProductLineItem must obey the limits set by the ProductLineItem's attributes 'MinOrderQuantity' and 'StepQuantity', i.e. for a 'MinOrderQuantity' of 2.0 and a 'StepQuantity' of 2.5 then values 2.0, 4.5, 7.0... are allowed values.
     */
    readonly minOrderQuantity : Quantity

    /**
     * Return the value portion of getMinOrderQuantity().
     */
    readonly minOrderQuantityValue : number

    /**
     * The ID of the product option this product line item represents. If the product line item does not represent an option, null is returned.
     */
    readonly optionID : string | null

    /**
     * The product option model for a product line item representing an option product. The returned option model has preselected values based on the dependent option line items of this product line item.
     * Null is returned if this line item does not represent an option product.
     */
    readonly optionModel : ProductOptionModel | null

    /**
     * Identifies if the product line item represents an option line item. Option line items do not represent true products but rather options of products. An option line item always has a parent product line item representing a true product.
     */
    readonly optionProductLineItem : boolean

    /**
     * A collection containing option product line items.
     */
    readonly optionProductLineItems : Collection<ProductLineItem>

    /**
     * The ID of the product option value this product line item represents. If the product line item does not represent an option, null is returned.
     */
    readonly optionValueID : string | null

    /**
     * The order-item extension for this item, or null. An order-item extension will only exist for a ProductLineItem which belongs to an Order.
     */
    readonly orderItem : OrderItem | null

    /**
     * The parent line item of this line item or null if the line item is independent.
     */
    readonly parent : ProductLineItem | null

    /**
     * The position within the line item container assigned to the ProductLineItem upon its creation, may be used as a sort-order. The position is updated in the following way:
    When a ProductLineItem is added to the LineItemCtnr, it is assigned the next available position, based on the current count
    When a ProductLineItem is removed from the LineItemCtnr then LineItemCtnr method reassignPositions is called, so that the 'gap' left by the removed line-item is refilled. This method is dependent on no 2 ProductLineItem having the same position. When a LineItemCtnr is copied (eg when a PlacedOrder is created from a Basket), no special position handling is necessary as the ProductLineItems are added according to theie current position ordering in the source LineItemCtnr.
    */
    readonly position : number

    /**
     * An iterator of price adjustments that have been applied to this product line item such as promotions on the purchase price (i.e. $10 Off or 10% Off).
     */
    readonly priceAdjustments : Collection<PriceAdjustment>

    /**
     *    The product associated with the product line item. The product line item might not be related to an actual catalog product, for example if it represents an option, or was not created from a catalog product, or if the product does not exist in the catalog anymore. In these cases, the method returns null.
     */
    readonly product : Product | null


    /**
     * The ID of the related product.
     */
    readonly productID : string

    /**
     * The inventory list the product line item is associated with. If the line item is not associated with a inventory list, or the inventory list does not exist, the method returns null.
     */
    readonly productInventoryList : ProductInventoryList | null

    /**
     * The ID of the inventory list the product line item is associated with.
     */
    readonly productInventoryListID : string | null

    /**
     * The associated ProductListItem.
     */
    readonly productListItem : ProductListItem

    /**
     * The name of product that was copied when product was added to line item container.
     */
    readonly productName : string

    /**
     * The price of this product line item after considering all dependent price adjustments and prorating all Buy-X-Get-Y and order-level discounts, according to the scheme described in PriceAdjustment.getProratedPrices(). For net pricing the net price is returned. For gross pricing, the gross price is returned.
     */
    readonly proratedPrice : Money

    /**
     * A Map of PriceAdjustment to Money instances. They keys to this map are the price adjustments that apply to this ProductLineItem either directly or indirectly when discounts are prorated according to the scheme described in PriceAdjustment.getProratedPrices(). The values in the map are the portion of the adjustment which applies to this particular product line item.
     */
    readonly proratedPriceAdjustmentPrices : Map<PriceAdjustment, Money>

    /**
     * The ProductLineItem that qualified the basket for this bonus product.

    This method is only applicable if the product line item is a bonus product line item, and if the promotion is a product promotion with number of qualifying products granting a bonus-product discount. If these conditions aren't met, the method returns null. If there are multiple product line items that triggered this bonus product, this method returns the last one by position within the order.
    */
    readonly qualifyingProductLineItemForBonusProduct : ProductLineItem | null

    /**
     * The quantity of the product represented by this ProductLineItem.
     */
    readonly quantity : Quantity

    /**
     * The value of the quantity of this ProductLineItem.
     */
    readonly quantityValue : number

    /**
     * All bonus product line items for which this line item is a qualifying product line item. This method is usually called when rendering the cart so that bonus products can be shown next to the products that triggered their creation.
     */
    readonly relatedBonusProductLineItems : Collection<ProductLineItem>

    /**
     * Returns if the product line item is reserved.

    Reservations for the basket can be created with e.g. Basket.reserveInventory(number).
    Method must only be called for basket product line items. Exception is thrown if called for order product line item.
    */
    readonly reserved : boolean

    /**
     * The associated Shipment.
     */
    readonly shipment : Shipment

    /**
     * The dependent shipping line item of this line item. The shipping line item can define product-specific shipping costs for this product line item.
     */
    readonly shippingLineItem : ProductShippingLineItem

    /**
     * Returns step quantity allowed for the product represented by the ProductLineItem (copied from product on initialization). Note: the quantity of a ProductLineItem must obey the limits set by the ProductLineItem's attributes 'MinOrderQuantity' and 'StepQuantity', i.e. for a 'MinOrderQuantity' of 2.0 and a 'StepQuantity' of 2.5 then values 2.0, 4.5, 7.0... are allowed values.
     */
    readonly stepQuantity : Quantity

    /**
     * Return the value portion of getStepQuantity().
     */
    readonly stepQuantityValue : number

    private constructor();


}

export = ProductLineItem;
