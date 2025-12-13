import Discount = require('./Discount');

/**
 * Represents an amount-off discount in the discount plan, for example "$10 off all orders $100 or more".
 */
declare class FixedPriceDiscount extends Discount {
	public constructor(amount : number)

	/**
	 * The fixed price amount, for example 0.99 for a "Shipping only $0.99" discount.
	 */
	readonly fixedPrice  :  number


	type: typeof Discount.TYPE_FIXED_PRICE;
}

export = FixedPriceDiscount;
