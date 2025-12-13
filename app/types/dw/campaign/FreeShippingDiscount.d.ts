import Discount = require('./Discount');

/**
 * Represents a free discount in the discount plan, for example "Free shipping on all orders $25 or more."
 */
declare class FreeShippingDiscount extends Discount {
	private constructor()

	type: typeof Discount.TYPE_FREE_SHIPPING;
}

export = FreeShippingDiscount;
