import ExtensibleObject = require('../object/ExtensibleObject');
import Collection = require('../util/Collection');
import CustomerGroup = require('../customer/CustomerGroup');
import Promotion = require('./Promotion');
import SourceCodeGroup = require('../campaign/SourceCodeGroup');
import StoreGroup = require('../catalog/StoreGroup');
import Store = require('../catalog/Store');
import Coupon = require('./Coupon');
import CustomAttributes = require('../object/CustomAttributes');

declare global {
    module ICustomAttributes {
        interface Campaign extends CustomAttributes{
        }
    }
}


/**
 * A Campaign is a set of experiences (or site configurations) which may be deployed as a single unit for a given time frame. The system currently supports 3 types of experience that may be assigned to a campaign:

    1. Promotions
    2. Slot Configurations
    3. Sorting Rules

This list may be extended in the future.

A campaign can have a start and end date or be open-ended. It may also have "qualifiers" which determine which customers the campaign applies to. The currently supported qualifiers are:

    1. Customer groups (where "Everyone" is a possible customer group)
    2. Source codes
    3. Coupons

A campaign can have list of stores or store groups where it can be applicable to.
 */
declare class Campaign extends ExtensibleObject<ICustomAttributes.Campaign> {
    private constructor();

    /**
     * Returns 'true' if the campaign is currently active, otherwise 'false'.
A campaign is active if it is enabled and scheduled for now.
     */
    readonly active : boolean;

    /**
     * Returns true if campaign is applicable to store, otherwise false.
     */
    readonly applicableInStore : boolean;

    /**
     * Returns true if campaign is applicable to online site, otherwise false.
     */
    readonly applicableOnline : boolean;

    /**
     * The coupons assigned to the campaign.
     */
    readonly coupons : Collection<Coupon>

    /**
     * The customer groups assigned to the campaign
     */
    readonly customerGroups : Collection<CustomerGroup>

    /**
     * The internal description of the campaign.
     */
    readonly description : string

    /**
     * Returns true if campaign is enabled, otherwise false.
     */
    readonly enabled : boolean

    /**
     * The end date of the campaign. If no end date is defined for the campaign, null is returned. A campaign w/o end date will run forever.
     */
    readonly endDate : Date | null

    /**
     * The unique campaign ID.
     */
    readonly ID : string

    /**
     * Returns promotions defined in this campaign in no particular order.
     */
    readonly promotions : Collection<Promotion>
    /**
     * Get the promotion associated with this discount.
     */
    readonly promotion : Promotion

    /**
     * Get the promotion ID associated with this discount.
     */
    readonly promotionID : string

    /**
     * The source codes assigned to the campaign.
     */
    readonly sourceCodeGroups : Collection<SourceCodeGroup>

    /**
     * The start date of the campaign. If no start date is defined for the campaign, null is returned. A campaign w/o start date is immediately effective.
     */
    readonly startDate : Date | null

    /**
     * Returns store groups assigned to the campaign.
     */
    readonly storeGroups : Collection<StoreGroup>

    /**
     * Returns stores assigned to the campaign.
     */
    readonly stores : Collection<Store>


}

export = Campaign;
