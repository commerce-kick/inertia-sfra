import Discount = require("./Discount");
import Product = require("../catalog/Product");
import List = require("../util/List");

declare class BonusChoiceDiscount extends Discount {

	/**
	 * Get the list of bonus products which the customer is allowed to choose from for this discount. This list is configured by a merchant entering a list of SKUs for the discount. Products which do not exist in the system, or are offline, or are not assigned to a category in the site catalog are filtered out. Unavailable (i.e. out-of-stock) products are NOT filtered out. This allows merchants to display out-of-stock bonus products with appropriate messaging.
If a returned product is a master product, the customer is entitled to choose from any variant. If the product is an option product, the customer is entitled to choose any value for each option. Since the promotions engine does not touch the value of the product option line items, it is the responsibility of custom code to set option prices.

If the promotion is rule based, then this method will return an empty list. A ProductSearchModel should be used to return the bonus products the customer may choose from instead. See ProductSearchModel.PROMOTION_PRODUCT_TYPE_BONUS and ProductSearchModel.setPromotionID(String)

	 */
	bonusProducts: List<Product>

	/**
	 * The maximum number of bonus items that a customer is entitled to select for this discount.
	 */
	maxBonusItems: number

	/**
	 * Returns true if this is a "rule based" bonus choice discount. For such discounts, there is no static list of bonus products associated with the discount but rather a discounted product rule associated with the promotion which defines the bonus products. To retrieve the list of selectable bonus products for display in the storefront, it is necessary to search for the bonus products using the ProductSearchModel API since the method getBonusProducts() in this class will always return an empty list. Furthermore, for rule based bonus-choice discounts, getBonusProductPrice(Product) will always return a price of 0.00 for bonus products.
	 */
	ruleBased: boolean


	type: typeof Discount.TYPE_BONUS_CHOICE;
}

export = BonusChoiceDiscount;
