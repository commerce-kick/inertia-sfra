import PersistentObject = require('../object/PersistentObject');
import Collection = require('../util/Collection');
import Promotion = require('./Promotion');

declare class Coupon extends PersistentObject {
    private constructor();
    /**
     * Constant representing coupon type multiple-codes.
     */
    static readonly TYPE_MULTIPLE_CODES : string

    /**
     * Constant representing coupon type single-code.
     */
    static readonly TYPE_SINGLE_CODE : string

    /**
     * Constant representing coupon type system-codes.
     */
    static readonly TYPE_SYSTEM_CODES : string

    /**
     * The prefix defined for coupons of type TYPE_SYSTEM_CODES If no prefix is defined, or coupon is of type TYPE_SINGLE_CODE or TYPE_MULTIPLE_CODES, null is returned.
     */
    readonly codePrefix : string

    /**
     * Returns true if coupon is enabled, else false.
     */
    readonly enabled : boolean  

    /**
     * The ID of the coupon.
     */
    readonly ID : string

    /**
     * The next unissued code of this coupon. For single-code coupons, the single fixed coupon code is returned. For all multi-code coupons, the next available, unissued coupon code is returned. If all codes of the coupon have been issued, then there is no next code, and null is returned. A transaction is required when calling this method. This needs to be ensured by the calling script.
     */
    readonly nextCouponCode : string | null

    /**
     * The coupon-based promotions directly or indirectly (through campaigns) assigned to this coupon.
     */
    readonly promotions : Collection<Promotion> 

    /**
     * The defined limit on redemptions per coupon code. Null is returned if no limit is defined, which means that each code can be redeemed an unlimited number of times.
     */
    readonly redemptionLimitPerCode : number | null 

    /**
     * The defined limit on redemptions of this coupon per customer. Null is returned if no limit is defined, which means that customers can redeem this coupon an unlimited number of times.
     */
    readonly redemptionLimitPerCustomer : number | null

    /**
     * The defined limit on redemptions per customer per timeframe (see getRedemptionLimitTimeFrame(). Null is returned if no limit is defined, which means that there is no time-specific redemption limit for customers.
     */
    readonly redemptionLimitPerTimeFrame : number | null

    /**
     * The timeframe (days) of the defined limit on redemptions per customer per timeframe. Null is returned if no limit is defined, which means that there is no time-specific redemption limit for customers.
     */
    readonly redemptionLimitTimeFrame : number  | null

    /**
     * The coupon type. Possible values are TYPE_SINGLE_CODE, TYPE_MULTIPLE_CODES and TYPE_SYSTEM_CODES.
     */
    readonly type : string 


}

export = Coupon;
