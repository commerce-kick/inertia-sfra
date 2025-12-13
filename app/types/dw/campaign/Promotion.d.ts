import ExtensibleObject = require('../object/ExtensibleObject');
import MarkupText = require('../content/MarkupText');
import Campaign = require('./Campaign');
import CustomAttributes = require('../object/CustomAttributes');
import Collection = require('../util/Collection');
import Coupon = require('./Coupon');
import CustomerGroup = require('../customer/CustomerGroup');
import MediaFile = require('../content/MediaFile');
import Product = require('../catalog/Product');
import Money = require('../value/Money');
import ProductOptionModel = require('../catalog/ProductOptionModel');
import SourceCodeGroup = require('./SourceCodeGroup');

declare global {
    module ICustomAttributes {
        interface Promotion extends CustomAttributes {
        }
    }
}
/**
 * This class represents a promotion. Examples of promotions include:

    "Get 20% off your order"
    "$15 off a given product"
    "free shipping for all orders over $50"
    Get a bonus product with purchase of another product

The Promotion class provides access to the basic attributes of the promotion such as name, callout message, and description, but the details of the promotion rules are not available in the API due to their complexity.

Commerce Cloud Digital allows merchants to create a single logical "promotion rule" (e.g. "Get 20% off your order") and then assign it to one or more "containers" where the supported container types are campaigns or AB-tests. A Promotion represents a specific instance of a promotion rule assigned to a container. Promotion rules themselves that are not assigned to any container are inaccessible through the API. Each instance (i.e. assignment) can have separate "qualifiers". Qualifiers are the customer groups, source code groups, or coupons that trigger a given promotion for a customer.
 */
declare class Promotion extends ExtensibleObject<ICustomAttributes.Promotion> {
    /**
     * Constant representing promotion exclusivity of type class.
     */
    static readonly EXCLUSIVITY_CLASS: "CLASS";

    /**
     * Constant representing promotion exclusivity of type global.
     */
    static readonly EXCLUSIVITY_GLOBAL: "GLOBAL";

    /**
     * Constant representing promotion exclusivity of type no.
     */
    static readonly EXCLUSIVITY_NO: "NO";

    /**
     * Constant representing promotion class of type order.
     */
    static readonly PROMOTION_CLASS_ORDER: 'ORDER'

    /**
     * Constant representing promotion class of type product.
     */
    static readonly PROMOTION_CLASS_PRODUCT: 'PRODUCT'

    /**
     * Constant representing promotion class of type shipping.
     */
    static readonly PROMOTION_CLASS_SHIPPING: 'SHIPPING'

    /**
     * Constant indicating that that all qualifier conditions must be met in order for this promotion to apply for a given customer.
     */
    static readonly QUALIFIER_MATCH_MODE_ALL: "all"

    /**
     * Constant indicating that that at least one qualifier condition must be met in order for this promotion to apply for a given customer.
     */
    static readonly QUALIFIER_MATCH_MODE_ANY: "any"

    /**
     * Returns 'true' if promotion is active, otherwise 'false'.
A promotion is active if its campaign is active, and the promotion is enabled, and it is scheduled for now.
     */
    readonly active: boolean

    /**
     * Returns 'true' if the promotion is triggered by coupons, false otherwise.
     */
    readonly basedOnCoupons: boolean

    /**
     * Returns 'true' if the promotion is triggered by a coupon, false otherwise.
     * @deprecated Use isBasedOnCoupons()
     */
    readonly basedOnCoupon: boolean

    /**
     * Returns 'true' if the promotion is triggered by customer groups, false otherwise.
     */
    readonly basedOnCustomerGroups: boolean

    /**
     * Returns 'true' if the promotion is triggered by source codes, false otherwise.
     */
    readonly basedOnSourceCodes: boolean

    /**
     * The callout message of the promotion.
     */
    readonly calloutMsg: MarkupText

    /**
     * The campaign this particular instance of the promotion is defined in.

Note: If this promotion is defined as part of an AB-test, then a Campaign object will be returned, but it is a mock implementation, and not a true Campaign. This behavior is required for backwards compatibility and should not be relied upon as it may change in future releases.
     */
    readonly campaign: Campaign

    /**
     * The promotion's combinable promotions. Combinable promotions is a set of promotions or groups this promotion can be combined with.
     */
    readonly combinablePromotions: string[]

    /**
     * A description of the condition that must be met for this promotion to be applicable.
     * @deprecated Use getDetails()
     */
    readonly conditionalDescription: MarkupText

    /**
     * The coupons directly assigned to the promotion or assigned to the campaign of the promotion.
     */
    readonly coupons: Collection<Coupon>

    /**
     * The customer groups directly assigned to the promotion or assigned to the campaign of the promotion.
     */
    readonly customerGroups: Collection<CustomerGroup>

    /**
     * The description of the promotion.
     * @deprecated Use getCalloutMsg()
     */
    readonly description: MarkupText

    /**
     * The detailed description of the promotion.
     */
    readonly details: MarkupText

    /**
     * Returns true if promotion is enabled, otherwise false.
     */
    readonly enabled: boolean

    /**
     * The effective end date of this instance of the promotion.
     */
    readonly endDate: Date | null

    /**
     * The promotion's exclusivity specifying how the promotion can be combined with other promotions.
     */
    readonly exclusivity: string

    /**
     * The unique ID of the promotion.
     */
    readonly ID: string

    /**
     * The reference to the promotion image.
     */
    readonly image: MediaFile

    /**
     * The date that this object was last modified.
     */
    readonly lastModified: Date

    /**
     * The promotion's mutually exclusive Promotions. Mutually exclusive Promotions is a set of promotions or groups this promotion cannot be combined with.
     */
    readonly mutuallyExclusivePromotions: string[]

    /**
     * The name of the promotion.
     */
    readonly name: string

    /**
     * The promotion class indicating the general type of the promotion. Possible values are PROMOTION_CLASS_PRODUCT, PROMOTION_CLASS_ORDER, and PROMOTION_CLASS_SHIPPING.
     */
    readonly promotionClass: IPROMOCLASS

    /**
     * The qualifier matching mode specified by this promotion.
     */
    readonly qualifierMatchMode: string

    /**
     * The promotion's rank.
     */
    readonly rank: number

    /**
     * Returns true if promotion is refinable, otherwise false.
     */
    readonly refinable: boolean

    /**
     * The source code groups directly assigned to the promotion or assigned to the campaign of the promotion.
     */
    readonly sourceCodeGroups: Collection<SourceCodeGroup>

    /**
     * The effective start date of this instance of the promotion.
     */
    readonly startDate: Date | null

    /**
     * The promotion's tags.
     */
    readonly tags: string[]


}


type IPROMOCLASS = typeof Promotion.PROMOTION_CLASS_ORDER |
	typeof Promotion.PROMOTION_CLASS_PRODUCT |
	typeof Promotion.PROMOTION_CLASS_SHIPPING

export = Promotion;
