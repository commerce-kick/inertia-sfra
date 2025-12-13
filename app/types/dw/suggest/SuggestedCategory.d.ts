import Category = require("../catalog/Category")


/**
 * This class represents a suggested catalog category. Use getCategory() method to get access to the actual Category object.
 */
declare class SuggestedCategory {
	protected constructor()

	/**
	 * This method returns the actual Category object corresponding to this suggested category.
	 */
	readonly category: Category

}


export = SuggestedCategory
