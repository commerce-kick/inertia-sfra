import ExtensibleObject = require('../object/ExtensibleObject');
import Money = require('../value/Money');
import List = require('../util/List');
import ProductLineItem = require('./ProductLineItem');
import Product = require('../catalog/Product');
import Promotion = require('../campaign/Promotion');
import Collection = require('../util/Collection');
import CouponLineItem = require('./CouponLineItem');
import CustomAttributes = require('../object/CustomAttributes');

declare global {
    module ICustomAttributes {
        interface BonusDiscountLineItem extends CustomAttributes {
        }
    }
}

declare class BonusDiscountLineItem extends ExtensibleObject<ICustomAttributes.BonusDiscountLineItem> {
    private constructor();

    /**
     * Returns whether the promotion that triggered the creation of this line item uses a rule to determine the list of bonus products.

    If the promotion is rule based, then a ProductSearchModel should be used to return the bonus products the customer may choose from, as the methods that return lists will return nothing. See getBonusProducts()
     */
    readonly bonusChoiceRuleBased : boolean


    /**
     * Get the product line items in the current LineItemCtnr representing the bonus products that the customer has selected for this discount.
     */
    readonly bonusProductLineItems  :  List<ProductLineItem>

    /**
     * Get the list of bonus products which the customer is allowed to choose from for this discount. This list is configured by a merchant entering a list of SKUs for the discount. Products which do not exist in the system, or are offline, or are not assigned to a category in the site catalog are filtered out. Unavailable (i.e. out-of-stock) products are **NOT** filtered out. This allows merchants to display out-of-stock bonus products with appropriate messaging.

    If the promotion which triggered this discount does not exist, or this promotion is rule based, then this method returns an empty list.

    If the promotion is rule based, then this method will return an empty list. A ProductSearchModel should be used to return the bonus products the customer may choose from instead. See ProductSearchModel.PROMOTION_PRODUCT_TYPE_BONUS and ProductSearchModel.setPromotionID(String)

    If a returned product is a master product, the customer is entitled to choose from any variant. If the product is an option product, the customer is entitled to choose any value for each option. Since the promotions engine does not touch the value of the product option line items, it is the responsibility of custom code to set option prices
     */
    readonly bonusProducts  :  List<Product>

    /**
     * Get the coupon line item associated with this discount.
     */
    readonly couponLineItem  :  CouponLineItem;

    /**
     * Get the maximum number of bonus items that the customer is permitted to select for this bonus discount.

If the promotion which triggered this discount does not exist, then this method returns 0.
     */
    readonly maxBonusItems  :  number


    /**
     * Get the promotion associated with this discount.
     */
    readonly promotion  :  Promotion

    /**
     * Get the promotion ID associated with this discount.
     */
    readonly promotionID  :  string


}


export = BonusDiscountLineItem;
