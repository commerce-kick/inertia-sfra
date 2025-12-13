import Promotion = require('../campaign/Promotion');
import Map = require('../util/Map')
/**
 * Superclass of all specific discount classes.
 */
declare class Discount {
	/**
	 * Constant representing discounts of type amount.
	 */
	static readonly TYPE_AMOUNT: 'AMOUNT'
	/**
	 * Constant representing discounts of type bonus.
	 */
	static readonly TYPE_BONUS: 'BONUS'

	/**
	 * Constant representing discounts of type bonus choice.
	 */
	static readonly TYPE_BONUS_CHOICE: 'BONUS_CHOICE'

	/**
	 * Constant representing discounts of type fixed-price.
	 */
	static readonly TYPE_FIXED_PRICE: 'FIXED_PRICE'

	/**
	 * Constant representing discounts of type fixed price shipping.
	 */
	static readonly TYPE_FIXED_PRICE_SHIPPING: 'FIXED_PRICE_SHIPPING'

	/**
	 * Constant representing discounts of type free.
	 */
	static readonly TYPE_FREE: 'FREE'

	/**
	 * Constant representing discounts of type free shipping.
	 */
	static readonly TYPE_FREE_SHIPPING: 'FREE_SHIPPING'

	/**
	 * Constant representing discounts of type percentage.
	 */
	static readonly TYPE_PERCENTAGE: 'PERCENTAGE'

	/**
	 * Constant representing discounts of type percent off options.
	 */
	static readonly TYPE_PERCENTAGE_OFF_OPTIONS: 'PERCENTAGE_OFF_OPTIONS'

	/**
	 * Constant representing discounts of type price book price.
	 */
	static readonly TYPE_PRICEBOOK_PRICE: 'PRICE_BOOK_PRICE'

	/**
	 * Constant representing discounts of type total fixed price.
	 */
	static readonly TYPE_TOTAL_FIXED_PRICE: 'TOTAL_FIXED_PRICE'


	protected constructor();


	/**
	 * The tier index by quantity Id of Product promotion. ProductLineItems may have more than one quantity, but not all items of that SKU may have received the same tier of promotion. Each quantity of the ProductLineItem is indexed from 1 to n, where n is the quantity of the ProductLineItem, and this method returns a mapping from that quantity index to the index of tier of the promotion that item received. For more information about tier indexes, see getPromotionTier() method.
	 */
	readonly itemPromotionTiers: Map<number, Promotion>

	/**
	 * The promotion this discount is based on.
	 */
	readonly promotion: Promotion

	/**
	 * The tier index for promotion at order level or bonus product. Promotion tiers are always evaluated in the order of the highest threshold (e.g. quantity, or amount) to the lowest threshold. The tier that is evaluated first (i.e. the highest quantity or amount) is indexed as 0, the next tier 1, etc. The lowest tier will have index n - 1, where n is the total number of tiers.
	 */
	readonly promotionTier: number | null

	/**
	 * The quantity of the discount. This quantity specifies how often this discount applies to its target object. For example, a 10% off discount with quantity 2 associated to a product line item with quantity 3 is applied to two items of the product line item.
	Discounts of order and shipping promotions, and bonus discounts have a fix quantity of 1.
	 */
	readonly quantity: number

	/**
	 * The type of the discount.
	 */
	readonly type: string


}

export = Discount;
