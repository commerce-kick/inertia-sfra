import Discount = require("./Discount");

declare class PercentageOptionDiscount extends Discount {
	/**
	 * Create a percentage-discount on the fly.
	 * @param percentage
	 */
	protected constructor(percentage);

	/**
	 * The percentage discount value, for example 10.00 for a "10% off" discount.
	 */
	percentage: number;


	type: typeof Discount.TYPE_PERCENTAGE_OFF_OPTIONS;
}

export = PercentageOptionDiscount;
