
import ShopperContextErrorCodes = require('./ShopperContextErrorCodes');

/**
 * This exception could be thrown by ShopperContextMgr.setShopperContext(ShopperContext, Boolean),
 * ShopperContextMgr.getShopperContext() and ShopperContextMgr.removeShopperContext() when an error occurs.
 *
 * The 'errorCode' property is set to one of the following values:
 * • ShopperContextErrorCodes.FEATURE_DISABLED = Indicates that the Shopper Context Feature is not enabled.
 * • ShopperContextErrorCodes.CUSTOM_QUALIFIERS_LIMIT_EXCEEDED = Indicates that the number of custom qualifiers in ShopperContext has exceeded the allowed limit.
 * • ShopperContextErrorCodes.ASSIGNMENT_QUALIFIERS_LIMIT_EXCEEDED = Indicates that the number of assignment qualifiers in ShopperContext has exceeded the allowed limit.
 * • ShopperContextErrorCodes.QUOTA_LIMIT_EXCEEDED = Indicates that the quota limit for the Shopper Context has been reached.
 * • ShopperContextErrorCodes.INTERNAL_ERROR = Indicates that an error occurred while setting, retrieving or deleting the shopper context.
 * • ShopperContextErrorCodes.INVALID_ARGUMENT = Indicates that an invalid client IP address was set in the Shopper Context.
 * • ShopperContextErrorCodes.INVALID_REQUEST_TYPE = Indicates that the request type is invalid. Request must be a SCAPI request, or a hybrid storefront request, or an OCAPI request using a SLAS token.
 */
declare class ShopperContextException extends APIException {
    /**
     * Indicates reason why the following methods failed: ShopperContextMgr.setShopperContext(ShopperContext, Boolean)
     * or ShopperContextMgr.getShopperContext() or ShopperContextMgr.removeShopperContext().
     */
    readonly errorCode:
        | typeof ShopperContextErrorCodes.ASSIGNMENT_QUALIFIERS_LIMIT_EXCEEDED
        | typeof ShopperContextErrorCodes.CUSTOM_QUALIFIERS_LIMIT_EXCEEDED
        | typeof ShopperContextErrorCodes.FEATURE_DISABLED
        | typeof ShopperContextErrorCodes.INTERNAL_ERROR
        | typeof ShopperContextErrorCodes.INVALID_ARGUMENT
        | typeof ShopperContextErrorCodes.INVALID_REQUEST_TYPE
        | typeof ShopperContextErrorCodes.QUOTA_LIMIT_EXCEEDED;
}

export = ShopperContextException;
