import Iterator = require('../util/Iterator')
import Suggestions = require('./Suggestions')
import SuggestedCategory = require('./SuggestedCategory')
/**
 * The category suggestion container provides access to categories found using the suggested terms as search criteria. The method getSuggestedCategories() can be used to get the list of found categories.
Furthermore the list of suggested terms, after processing the original user input search query, is accessible through SearchPhraseSuggestions.getSuggestedTerms() method.
 */
declare class CategorySuggestions extends Suggestions {
	private constructor()


	/**
	 * This method returns a list of categories which were found using the suggested terms as search criteria. The category lookup is being executed in the current catalog and locale.
}
	 */
	readonly suggestedCategories  :  Iterator<SuggestedCategory>

}


export = CategorySuggestions
