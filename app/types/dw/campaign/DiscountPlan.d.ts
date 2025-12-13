import Collection = require('../util/Collection');
import Discount = require('./Discount');
import LineItemCtnr = require('../order/LineItemCtnr');
import AmountDiscount = require('./AmountDiscount');
import PercentageDiscount = require('./PercentageDiscount');
import Shipment = require('../order/Shipment');
import ShippingMethod = require('../order/ShippingMethod');
import ProductLineItem = require('../order/ProductLineItem');

/**
 * DiscountPlan represents a set of Discounts. Instances of the class are returned by the PromotionMgr when requesting applicable discounts for a specified set of promotions and a line item container (see PromotionMgr.getDiscounts(LineItemCtnr, PromotionPlan)).
 * DiscountPlan provides methods to access the discounts contained in the plan, add additional discounts to the plan (future) or remove discounts from the plan.
 */
declare class DiscountPlan {
	/**
	 * Get the collection of order discounts that the LineItemCtnr "almost" qualifies for based on the merchandise total in the cart. Nearness is controlled by thresholds configured at the promotion level.
	 * The collection of returned approaching discounts is ordered by the condition threshold of the promotion (e.g. "spend $100 and get 10% off" discount is returned before "spend $150 and get 15% off" discount.) A discount is not returned if it would be prevented from applying (because of compatibility rules) by an order discount already in the DiscountPlan or an approaching order discount with a lower condition threshold.
	 */
	readonly approachingOrderDiscounts: Collection<Discount>;

	/**
	 * All bonus discounts contained in the discount plan.
	 */
	readonly bonusDiscounts: Collection<Discount>;

	/**
	 * Returns line item container associated with discount plan.
	 A discount plan is created from and associated with a line item container. This method returns the line item container associated with this discount plan.
	 */
	lineItemCtnr: LineItemCtnr<any>;

	/**
	 * The percentage and amount order discounts contained in the discount plan.
	 */
	orderDiscounts: Collection<AmountDiscount | PercentageDiscount>;


}


export = DiscountPlan
