import ExtensibleObject = require('../object/ExtensibleObject');
import Collection = require('../util/Collection');
import BonusDiscountLineItem = require('./BonusDiscountLineItem');
import PriceAdjustment = require('./PriceAdjustment');
import CustomAttributes = require('../object/CustomAttributes');

declare global {
    module ICustomAttributes {
        interface CouponLineItem extends CustomAttributes {
        }
    }
}

/**
 * The CouponLineItem class is used to store redeemed coupons in the Basket.
 */
declare class CouponLineItem extends ExtensibleObject<ICustomAttributes.CouponLineItem> {
    private constructor();
    /**
     * Identifies if the coupon is currently applied in the basket. A coupon line is applied if there exists at least one price adjustment related to the coupon line item.
     */
    applied : boolean

    /**
     * Returns true the line item represents a coupon of a Commerce Cloud Digital campaign. If the coupon line item represents a custom coupon code, the method returns false.
     */
    basedOnCampaign : boolean

    /**
     * The bonus discount line items of the line item container triggered by this coupon.
     */
    bonusDiscountLineItems : Collection<BonusDiscountLineItem>

    /**
     * The coupon code.
     */
    couponCode : string  

    /**
     * The price adjustments of the line item container triggered by this coupon.
     */
    priceAdjustments : Collection<PriceAdjustment>

    /**
     * This method provides a detailed error status in case the coupon code of this coupon line item instance became invalid.
     */
    statusCode : string

    /**
     * Allows to check whether the coupon code of this coupon line item instance is valid. Coupon line item is valid, if status code is one of the following:

        * CouponStatusCodes.APPLIED
        * CouponStatusCodes.NO_APPLICABLE_PROMOTION

    */
    valid : boolean  


}

export = CouponLineItem;
