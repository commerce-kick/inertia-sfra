import ShopperContext = require('./ShopperContext');
import ShopperContextException = require('./ShopperContextException');

/**
 * Provides static helper methods for managing Shopper Context.
 *
 * Shopper Context is used to personalize shopper experiences with context values
 * such as custom session attributes, assignment qualifiers, geolocation, effective
 * datetime, source code and more. When Shopper Context is set for a shopper, it
 * can activate promotions or price books assigned to customer groups, source codes,
 * or stores (via assignments) in the subsequent requests, not the current request.
 *
 * Shopper Context is used to personalize the shopper experience in case of
 * Composable/Headless or Hybrid storefront implementations that use Shopper Login and API
 * Access Service (SLAS).
 *
 * NOTE: This script API is not intended to be used for standard server-side
 * storefront implementations. Only for Composable/Headless or Hybrid storefront
 * implementations.
 *
 * Unlike CustomerContextMgr which is used to set just Effective Time for which the customer is shopping at,
 * Shopper Context API provides a way to set many types of contexts such as custom
 * session attributes, assignment qualifiers, geolocation, effective datetime,
 * source code etc.
 *
 * The following feature toggles and site preferences must be enabled in order to
 * use this script API:
 *
 * • Enable Shopper Context Feature
 * • Enable Hybrid Authentication Feature - only in case of Hybrid storefront
 * implementations
 * • Hybrid Auth Settings' site preference - only in case of Hybrid storefront
 * implementations
 *
 * ShopperContextMgr is used to create, access and delete Shopper Context.
 *
 * • To add Shopper Context, use methods setShopperContext(ShopperContext, Boolean).
 * • To access Shopper Context, use method getShopperContext().
 * • To delete Shopper Context, use methods removeShopperContext().
 */
declare class ShopperContextMgr {
    /**
     * The ShopperContext if it exists for the customer. Returns null if it does not exist.
     */
    static readonly shopperContext: ShopperContext | null;

    /**
     * This class does not have a constructor, so you cannot create it directly.
     */
    private constructor();


}

export = ShopperContextMgr;
