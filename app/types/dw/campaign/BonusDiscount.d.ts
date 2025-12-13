import Discount = require('./Discount');
import Collection = require('../util/Collection');
import Product = require('../catalog/Product');

/**
 * Represents an amount-off discount in the discount plan, for example "$10 off all orders $100 or more".
 */
declare class BonusDiscount extends Discount {
	protected constructor();

	/**
	 * The bonus products associated with this discount that are in stock, online and assigned to site catalog.
	 */
	bonusProducts  :  Collection<Product>


	type: typeof Discount.TYPE_BONUS;
}

export = BonusDiscount;
