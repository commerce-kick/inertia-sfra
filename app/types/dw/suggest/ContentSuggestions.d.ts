import Iterator = require('../util/Iterator')
import Suggestions = require('./Suggestions')
import SuggestedContent = require('./SuggestedContent')
/**
 *The content suggestion container provides access to content pages found using the suggested terms as search criteria. The method getSuggestedContent() can be used to get the list of found content pages.
Furthermore the list of suggested terms, after processing the original user input search query, is accessible through SearchPhraseSuggestions.getSuggestedTerms() method.
 */
declare class ContentSuggestions extends Suggestions {
	private constructor()


	/**
	 *
This method returns a list of content pages which were found using the suggested terms as search criteria. The content lookup is being executed in the current library and locale.
	 */
	readonly suggestedContent  :  Iterator<SuggestedContent >


}


export = ContentSuggestions
