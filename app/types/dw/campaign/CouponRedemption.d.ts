/**
 * Represents a redeemed coupon.
 */
declare class CouponRedemption {
    private constructor();

    /**
     *  Returns email of redeeming customer.
     */
    readonly customerEmail  :  string
    /**
     * Returns number of the order the code was redeemed with.
     */
    readonly orderNo  :  string
    /**
     * Returns date of redemption.
     */
    readonly redemptionDate  :  Date

}

export = CouponRedemption;
