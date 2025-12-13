import Discount = require("./Discount");

declare class PercentageOptionDiscount extends Discount {
	/**
	 * Create a percentage-discount on the fly.
	 * @param percentage
	 */
	protected constructor();

	/**
	 * The price book identifier.
	 */
	readonly priceBookID: string


	type: typeof Discount.TYPE_PRICEBOOK_PRICE;
}

export = PercentageOptionDiscount;
