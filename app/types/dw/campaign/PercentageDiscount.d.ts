import Discount = require("./Discount");

declare class PercentageDiscount extends Discount {

	/**
	 * The percentage discount value, for example 10.00 for a "10% off" discount.
	 */
	percentage: number;


	type: typeof Discount.TYPE_PERCENTAGE;
}

export = PercentageDiscount;
