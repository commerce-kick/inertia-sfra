import Map = require('../../util/Map');
import Set = require('../../util/Set');
import Geolocation = require('../../util/Geolocation');

/**
 * The class represents Shopper Context. It is used to manage personalized shopping
 * experiences on your storefront.
 *
 * Shopper Context is used to personalize shopper experiences with context values
 * such as custom session attributes, assignment qualifiers, geolocation, clientIP
 * address, effective date time, source code and customer groups.
 *
 * When Shopper Context is set for a shopper, the context is applied in the next
 * request and can activate promotions or price books assigned to customer groups,
 * source codes, or stores (via assignments).
 */
declare class ShopperContext {
    /**
     * The assignment qualifiers from the Shopper Context. Assignment qualifiers are
     * set when using the assignment framework to trigger pricing and promotion
     * experiences for Products, Product Search, Basket, Shipping methods etc.
     */
    readonly assignmentQualifiers: Map<string, string>;

    /**
     * The IP address of the client from the Shopper Context.
     */
    readonly clientIP: string;

    /**
     * Returns customer group IDs from the Shopper Context to apply. The customer group
     * IDs set in Shopper Context evaluate to customer groups that trigger the
     * promotions (campaign assignment) assigned to the customer groups.
     */
    readonly customerGroupIDs: Set<string>;

    /**
     * The custom qualifiers from the Shopper Context. Custom qualifiers contain the
     * custom session attributes set in the Shopper Context.
     */
    readonly customQualifiers: Map<string, string>;

    /**
     * The effective date time from the Shopper Context. With the effective date time
     * you can retrieve promotions that are active at a particular time. For example,
     * "Shop the Future" use cases.
     */
    readonly effectiveDateTime: Date;

    /**
     * The geographic location from the Shopper Context.
     */
    readonly geolocation: Geolocation;

    /**
     * The source code from the Shopper Context. The source code set in Shopper Context
     * evaluates to source code group that triggers the promotion (campaign
     * assignment) and Price books (assigned to Source code group).
     */
    readonly sourceCode: string;


}

export = ShopperContext;
