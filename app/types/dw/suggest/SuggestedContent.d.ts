import Content = require('../content/Content')

/**
 * This class represents a suggested content page. Use getContent() method to get access to the actual Content object.
 */
declare class SuggestedContent {
	protected constructor()

	/**
	 * This method returns the actual Content object corresponding to this suggested content.
	 */
	readonly content: Content


}

export = SuggestedContent
