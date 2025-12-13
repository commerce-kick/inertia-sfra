/**
 * This exception could be thrown by LineItemCtnr.createCouponLineItem(String, Boolean) when the provided coupon code is invalid.
 *
 * The 'errorCode' property is set to one of the following values:
 * • CouponStatusCodes.COUPON_CODE_ALREADY_IN_BASKET = Indicates that coupon code has already been added to basket.
 * • CouponStatusCodes.COUPON_ALREADY_IN_BASKET = Indicates that another code of the same MultiCode/System coupon has already been added to basket.
 * • CouponStatusCodes.COUPON_CODE_ALREADY_REDEEMED = Indicates that code of MultiCode/System coupon has already been redeemed.
 * • CouponStatusCodes.COUPON_CODE_UNKNOWN = Indicates that coupon not found for given coupon code or that the code itself was not found.
 * • CouponStatusCodes.COUPON_DISABLED = Indicates that coupon is not enabled.
 * • CouponStatusCodes.REDEMPTION_LIMIT_EXCEEDED = Indicates that number of redemptions per code exceeded.
 * • CouponStatusCodes.CUSTOMER_REDEMPTION_LIMIT_EXCEEDED = Indicates that number of redemptions per code and customer exceeded.
 * • CouponStatusCodes.TIMEFRAME_REDEMPTION_LIMIT_EXCEEDED = Indicates that number of redemptions per code, customer and time exceeded.
 * • CouponStatusCodes.NO_ACTIVE_PROMOTION = Indicates that coupon is not assigned to an active promotion.
 */
declare class CreateCouponLineItemException extends APIException {
    private constructor();

    /**
     * Returns one of the error codes listed in the class doc.
     */
    readonly errorCode: string;
}

export = CreateCouponLineItemException;
