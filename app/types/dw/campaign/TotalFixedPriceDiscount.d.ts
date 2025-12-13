import Discount = require("./Discount");

declare class TotalFixedPriceDiscount extends Discount {
	/**
	 * Create a percentage-discount on the fly.
	 * @param percentage
	 */
	protected constructor();

	/**
	 * The total fixed price amount.
	 */
	readonly totalFixedPrice  :  number


	type: typeof Discount.TYPE_TOTAL_FIXED_PRICE;
}

export = TotalFixedPriceDiscount;
