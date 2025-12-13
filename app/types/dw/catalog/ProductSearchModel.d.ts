import SearchModel = require('./SearchModel');
import URL = require('../web/URL');
import Category = require('./Category');
import Product = require('./Product');
import List = require('../util/List');
import SortingRule = require('./SortingRule');
import ProductSearchHit = require('./ProductSearchHit');
import ProductSearchRefinements = require('./ProductSearchRefinements');
import SearchPhraseSuggestions = require('../suggest/SearchPhraseSuggestions');
import PageMetaTag = require('../web/PageMetaTag');
import Iterator = require('../util/Iterator');
import StoreInventoryFilter = require('./StoreInventoryFilter');
import SearchStatus = require('../system/SearchStatus');


/**
 * The class is the central interface to a product search result and a product search refinement. It also provides utility methods to generate a search URL
 */
declare class ProductSearchModel extends SearchModel {
    /**
     * URL Parameter for the category ID
     */
    static readonly CATEGORYID_PARAMETER: "cgid"

    /**
     * URL Parameter for the inventory list IDs
     */
    static readonly INVENTORY_LIST_IDS_PARAMETER: "ilids"

    /**
     * The maximum number of inventory list IDs that can be passed to setInventoryListIDs(List)
     */
    static readonly MAXIMUM_INVENTORY_LIST_IDS: 10

    /**
     * The maximum number of product IDs that can be passed to setProductIDs(List)
     */
    static readonly MAXIMUM_PRODUCT_IDS: 30

    /**
     * The maximum number of store inventory filter values that can be passed to setStoreInventoryFilter(StoreInventoryFilter)
     */
    static readonly MAXIMUM_STORE_INVENTORY_FILTER_VALUES: 5

    /**
     * URL Parameter for the maximum price
     */
    static readonly PRICE_MAX_PARAMETER: "pmax"

    /**
     * URL Parameter for the minimum price
     */
    static readonly PRICE_MIN_PARAMETER: "pmin"

    /**
     * URL Parameter for the product ID
     */
    static readonly PRODUCTID_PARAMETER: "pid"

    /**
     * constant indicating that all related products should be returned for the next product search by promotion ID
     */
    static readonly PROMOTION_PRODUCT_TYPE_ALL: "all"

    /**
     * constant indicating that only bonus products should be returned for the next product search by promotion ID. This constant should be set using setPromotionProductType(string) when using the search model to find the available list of bonus products for a Choice of Bonus Product (Rule) promotion, along with setPromotionID(string).
     */
    static readonly PROMOTION_PRODUCT_TYPE_BONUS: "bonus"

    /**
     * constant indicating that only discounted products should be returned for the next product search by promotion ID
     */
    static readonly PROMOTION_PRODUCT_TYPE_DISCOUNTED: "discounted"

    /**
     * URL Parameter for the promotion product type
     */
    static readonly PROMOTION_PRODUCT_TYPE_PARAMETER: "pmpt"

    /**
     * constant indicating that only qualifying products should be returned for the next product search by promotion ID
     */
    static readonly PROMOTION_PRODUCT_TYPE_QUALIFYING: "qualifying"

    /**
     * URL Parameter for the promotion ID
     */
    static readonly PROMOTIONID_PARAMETER: "pmid"

    /**
     * URL Parameter prefix for a refinement name
     */
    static readonly REFINE_NAME_PARAMETER_PREFIX: "prefn"

    /**
     * URL Parameter prefix for a refinement value
     */
    static readonly REFINE_VALUE_PARAMETER_PREFIX: "prefv"

    /**
     * URL Parameter prefix for a refinement value
     */
    static readonly SORT_BY_PARAMETER_PREFIX: "psortb"

    /**
     * URL Parameter prefix for a refinement value
     */
    static readonly SORT_DIRECTION_PARAMETER_PREFIX: "psortd"

    /**
     * URL Parameter prefix for a sorting rule
     */
    static readonly SORTING_RULE_PARAMETER: "srule"

    /**
     * The category object for the category id specified in the query. If a category with that id doesn't exist or if the category is offline this method returns null.
     */
    readonly category: Category | null

    /**
     * The category id that was specified in the search query.
     */
    categoryID: string

    /**
     * The method returns true, if this is a pure search for a category. The method checks, that a category ID is specified and no search phrase is specified.
     */
    readonly categorySearch: boolean

    /**
     * The deepest common category of all products in the search result. In case of an empty search result the method returns the root category.
     */
    readonly deepestCommonCategory: Category

    /**
     * The sorting rule used to order the products in the results of this query, or null if no search has been executed yet. In contrast to getSortingRule(), this method respects explicit sorting rules and sorting options and rules determined implicitly based on the refinement category, keyword sorting rule assignment, etc.
     */
    readonly effectiveSortingRule: SortingRule | null

    /**
     * Important Note: This API is not GA and is currently a pilot/beta service as defined by the customer's main services agreement and provided as-is. If you are not part of the pilot/beta program, the API will throw an exception. Contact your customer success representative for more information.
     * Returns a list of inventory IDs that were specified in the search query or an empty list if no inventory ID set.
     */
    readonly inventoryIDs: List<string>

    /**
     * Get the flag indicating whether unorderable products should be excluded when the next call to getProducts() is made. If this value has not been previously set, then the value returned will be based on the value of the search preference.
     */
    orderableProductsOnly: boolean

    /**
     * Reserved for beta users.
    Returns all page meta tags, defined for this instance for which content can be generated.
    The meta tag content is generated based on the product listing page meta tag context and rules. The rules are obtained from the current category context or inherited from the parent category, up to the root category.
    */
    readonly pageMetaTags: Array<PageMetaTag>

    /**
     * The method indicates if the search result is ordered by a personalized sorting rule.
     */
    readonly personalizedSort: boolean

    /**
     * The maximum price for the product associated with this search.
     */
    priceMax: number

    /**
     * The minimum price for the product associated with this search.
     */
    priceMin: number

    /**
     * The product id that was specified in the search query.
     * @deprecated Please use getProductIDs() instead
     */
    productID: string

    /**
     * A list of product IDs that were specified in the search query or an empty list if no product ID set.
     */
    readonly productIDs: List<string>

    /**
     * All products in the search result.
    Note that products that were removed or went offline since the last index update are not included in the returned set.
    */
    readonly products: Iterator<Product>

    /**
     * The product search hits in the search result.
    Note that method does also return search hits representing products that were removed or went offline since the last index update, i.e. you must implement appropriate checks before accessing the product related to the search hit instance (see ProductSearchHit.getProduct)
    */
    readonly productSearchHits: Iterator<ProductSearchHit>

    /**
     * The promotion id that was specified in the search query or null if no promotion id set. If multiple promotion id's specified the method returns only the first id. See setPromotionIDs(List) and getPromotionIDs().
     */
    promotionID: string | null

    /**
     * A list of promotion id's that were specified in the search query or an empty list if no promotion id set.
     */
    readonly promotionIDs: List<string>

    /**
     * The promotion product type specified in the search query.
     */
    promotionProductType: string

    /**
     * Get the flag that determines if the category search will be recursive.
     */
    recursiveCategorySearch: boolean

    /**
     * The method returns true, if the search is refined by a category. The method checks, that a category ID is specified.
     */
    readonly refinedByCategory: boolean

    /**
     * Identifies if this search has been refined by price.
     */
    readonly refinedByPrice: boolean

    /**
     * Identifies if this search has been refined by promotion.
     */
    readonly refinedByPromotion: boolean

    /**
     * Identifies if this is a category search and is refined with further criteria, like a brand refinement or an attribute refinement.
     */
    readonly refinedCategorySearch: boolean

    /**
     * The category used to determine possible refinements for the search. If an explicit category was set for this purpose using setRefinementCategory(Category), it is returned. Otherwise, the deepest common category of all search results will be returned.
     */
    refinementCategory: Category

    /**
     * The ProductSearchRefinements associated with this search and filtered by session currency.
     */
    readonly refinements: ProductSearchRefinements

    /**
     * This method returns the URL of the endpoint where the merchants should upload their image for visual search.
     */
    readonly searchableImageUploadURL: string

    /**
     * Returns search phrase suggestions for the current search phrase. Search phrase suggestions may contain alternative search phrases as well as lists of corrected and completed search terms.
     */
    readonly searchPhraseSuggestions: SearchPhraseSuggestions

    /**
     * The sorting rule explicitly set on this model to be used to order the products in the results of this query, or null if no rule has been explicitly set. This method does not return the sorting rule that will be used implicitly based on the context of the search, such as the refinement category.
     */
    sortingRule: SortingRule

    /**
     * Important Note: This API is not GA and is currently a pilot/beta service as defined by the customer's main services agreement and provided as-is. If you are not part of the pilot/beta program, the API will throw an exception. Contact your customer success representative for more information.
     * Returns the StoreInventoryFilter, which was specified for this search.
     */
    readonly storeInventoryFilter: StoreInventoryFilter

    /**
     * The suggested search phrase with the highest accuracy provided for the current search phrase.
     * @deprecated Please use getSearchPhraseSuggestions() instead
     */
    readonly suggestedSearchPhrase: string

    /**
     * A list with up to 5 suggested search phrases provided for the current search phrase. It is possible that less than 5 suggestions or even no suggestions are returned.
     * @deprecated Please use getSearchPhraseSuggestions() instead
     */
    readonly suggestedSearchPhrases: List<string>

    /**
     * The method indicates if no-hits search should be tracked for predictive intelligence use.
     */
    readonly trackingEmptySearchesEnabled: boolean

    /**
     * The method returns true, if this is a visual search. The method checks that a image UUID is specified.
     */
    readonly visualSearch: boolean


    // Additional methods from SFCC documentation


    // URL refinement methods for promotions


}

export = ProductSearchModel;
