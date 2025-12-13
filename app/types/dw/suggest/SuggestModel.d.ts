import ProductSuggestions = require('./ProductSuggestions')
import SearchPhraseSuggestions = require('./SearchPhraseSuggestions')
import Iterator = require('../util/Iterator')
import SuggestedPhrase = require('./SuggestedPhrase')
import CategorySuggestions = require('./CategorySuggestions')
import ContentSuggestions = require('./ContentSuggestions')
import BrandSuggestions = require('./BrandSuggestions')
import CustomSuggestions = require('./CustomSuggestions')


/**
 * The Suggest model provides methods and functions to access search suggestions.
The search suggestion feature basically covers two functional areas. First is just to suggest words, based on the users input, utilizing spell correction or prediction (also known as auto completion). The second functional area is also often referred to as search-as-you-type, where, based on the users input, specific items are already looked up, before the user actually has completed typing a word or even fired up the search.

This model combines both functional areas and provides access to both - the suggested words and the items found while using the predicted words.

This model supports various types of items that are being suggested, like products, categories, brands, content pages as well merchant provided search phrases. For each type, there is a Suggestions implementation available and accessible through this model: ProductSuggestions, CategorySuggestions, BrandSuggestions, ContentSuggestions, and CustomSuggestions.

For each type of suggestions, the actual suggested items (like products) can by obtained, and, on the other hand, a list of terms is provided which were used to lookup the found items. The terms can be used to present a advanced user experience in the storefront, e.g. show auto completed words, spell corrections and so on.
 *
 */
declare class SuggestModel {
    static readonly MAX_SUGGESTIONS: 10;

    /**
     *  A BrandSuggestions container for the current search phrase. The BrandSuggestions container provides access to the found brands (if any) and the terms suggested by the system with respect to the known product brands in the catalog.
     */
    readonly brandSuggestions  :  BrandSuggestions;

    /**
     * A CategorySuggestions container for the current search phrase. The CategorySuggestions container provides access to the found categories (if any) and the terms suggested by the system with respect to the known categories in the catalog.
     */
    readonly categorySuggestions  :  CategorySuggestions;

    /**
     * A ContentSuggestions container for the current search phrase. The ContentSuggestions container provides access to the found content pages (if any) and the terms suggested by the system with respect to the known content in the library.
     */
    readonly contentSuggestions  :  ContentSuggestions;

    /**
     * A CustomSuggestions container for the current search phrase. The CustomSuggestions container provides access to matching custom phrases (if any) and the terms suggested by the system with respect to the merchant provided custom phrases.
     */
    readonly customSuggestions  :  CustomSuggestions;

    /**
     * Use this method to obtain a list of search phrases that currently are very popular among all users across the Site. The search phrases are specific to the region (based on user's IP address), language (locale) and the user's browser type (agent).
     */
    readonly popularSearchPhrases  :  Iterator<SuggestedPhrase>;

    /**
     * A ProductSuggestions container for the current search phrase. The ProductSuggestions container provides access to the found products (if any) and the terms suggested by the system with respect to the known products in the catalog.
     */
    readonly productSuggestions  :  ProductSuggestions;

    /**
     * Use this method to obtain a list of personalized search phrases that the current user entered recently. The user is being identified by the CQuotient tracking cookie.
     */
    readonly recentSearchPhrases  :  Iterator<SuggestedPhrase>;


	/**
	 * The suggested search phrases that are associated to this suggestions.
	 *  In contrast to the suggested items, the suggested phrases contains the corrected and completed versions of the original search phrase.
	 */
	readonly searchPhraseSuggestions  :  SearchPhraseSuggestions

}

export = SuggestModel;

