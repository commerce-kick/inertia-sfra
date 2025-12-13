import LineItemCtnr = require ('../order/LineItemCtnr');
import CustomAttributes = require('../object/CustomAttributes')
import DiscountPlan = require('./DiscountPlan');
import PromotionPlan = require('./PromotionPlan');
import Campaign = require('./Campaign');
import Collection = require('../util/Collection');
import Promotion = require('./Promotion');


/**
 * PromotionMgr is used to access campaigns and promotion definitions, display active or upcoming promotions in a storefront, and to calculate and apply promotional discounts to line item containers.
To access campaign and promotion definitions, use methods getCampaigns(), getCampaign(String), getPromotions() and getPromotion(String).

To display active or upcoming promotions in the storefront, e.g. on product pages, various methods are provided. getActivePromotions() returns a PromotionPlan with all enabled promotions scheduled for now. getActiveCustomerPromotions() returns a PromotionPlan with all enabled promotions scheduled for now and applicable for the session currency, current customer and active source code. getUpcomingPromotions(Number) returns a PromotionPlan with all promotions that are enabled, not scheduled for now, but scheduled for any time between now and now + previewTime(hours).

Applying promotions to line item containers is a 3-step process, and PromotionMgr provides methods supporting each of these steps. Convenience methods can be used that execute all three steps at once, or the steps can be executed individually if you need to customize the output of the steps due to specific business rules.

    - Step 1 - calculate active customer promotions: Determine the active promotions for the session currency, current customer, source code and redeemed coupons.
    - Step 2 - calculate applicable discounts: Based on the active promotions determined in step 1, applicable discounts are calculated.
    - Step 3 - apply discounts: applicable discounts are applied to a line item container by creating price adjustment line items.

The simpliest way to execute steps 1-3 is to use method applyDiscounts(LineItemCtnr). The method identifies all active customer promotions, calculates and applies applicable discounts.

Due to specific business rules it might be necessary to manipulate the set of applicable discounts calculated by the promotion engine before applying them to the line item container. To implement such a scenario, you want to use method getDiscounts(LineItemCtnr), which identifies all active customer promotions, and calculates and returns applicable discounts in an instance of DiscountPlan. The discount plan contains a description for all applicable discounts for the specified line item container, and you can remove discounts from it if necessary. The customized discount plan can then be passed on for application by using method applyDiscounts(DiscountPlan).

Due to specific business rules it might be necessary to manipulate the set of active customer promotions before calculating applicable discounts from it. For example, you might want to add promotions to the plan or remove promotions from it. You want to use method getActiveCustomerPromotions(), which identifies all active customer promotions and returns an instance of PromotionPlan. You can add promotions to the promotion plan or remove promotions from the plan. The customized promotion plan can then be passed on to calculate applicable discounts by using method getDiscounts(LineItemCtnr, PromotionPlan).
 */
declare class PromotionMgr {

    /**
     * Identifies active promotions, calculates the applicable discounts from these promotions and applies these discounts to the specified line item container.
    As a result of this method, the specified line item container contains price adjustments and/or bonus product line items for all applicable discounts. The method also removes price adjustment and/or bonus product line items from the line item container if the related to promotions/discounts are no longer applicable.
     */
    static applyDiscounts<T extends CustomAttributes>(lineItemCtnr: LineItemCtnr<T>): void


    /**
        Returns the discounts applicable for the current customer, active source code and specified line item container.
    This method identifies all active promotions assigned to the customer groups of the current customer, the active source code and any coupon contained in the specified line item container, and calculates applicable discounts from these promotions.
    The applicable discounts are contained in the returned instance of DiscountPlan.

    Parameters:
    @param lineItemCtnr - Line item container
    @returns Discount plan with applicable discounts
     *  lineItemCtnr
     */
    static getDiscounts<T extends CustomAttributes>(lineItemCtnr: LineItemCtnr<T>): DiscountPlan

    /**
     * Returns the discounts applicable for the current customer, active source code and specified line item container, based on the specified promotion plan.
    This method calculates applicable discounts from the promotions in the specified promotion plan.Note that any promotion in the promotion plan that is inactive, or not applicable for the current customer or source code, is being ignored.
    The applicable discounts are contained in the returned instance of DiscountPlan.

        Parameters:
    @param lineItemCtnr Line item container
    @param promotionPlan Promotion plan with active promotions
    @returns Discount plan with applicable discounts
     */
    static getDiscounts<T extends CustomAttributes>(lineItemCtnr: LineItemCtnr<T>, promotionPlan: PromotionPlan): DiscountPlan


	/**
     *   Returns all promotions scheduled for now and applicable for the session currency, current customer, source code, or presented coupons.
        The active promotions are returned in an instance of PromotionPlan. The promotion plan contains all promotions assigned to any customer group of the current customer, the current source code, or coupons in the current session basket.
        @returns PromotionPlan with active customer promotions
        See Also:
        getActivePromotions()
     */
    static readonly activeCustomerPromotions: PromotionPlan

}


export = PromotionMgr;
