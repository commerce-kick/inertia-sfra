import ProductSearchHit = require('../catalog/ProductSearchHit')

/**
 * This class represents a suggested product. Use getProductSearchHit() method to get access to the actual ProductSearchHit object.
 */
declare class SuggestedProduct {
	protected constructor()
	/**
	This method returns the actual ProductSearchHit object corresponding to this suggested product.
	 *
	 */
	readonly productSearchHit  :  ProductSearchHit


}

export = SuggestedProduct
