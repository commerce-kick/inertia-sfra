import URL = require('../web/URL');
import Collection = require('../util/Collection');
import URLRedirect = require('../web/URLRedirect');
import SearchStatus = require('../system/SearchStatus');

/**
 * Common search model base class.
 */
declare class SearchModel {
    protected constructor();
    /**
     * URL Parameter for the Search Phrase
     */
    static readonly SEARCH_PHRASE_PARAMETER: "q"

    /**
     * Sorting parameter ASCENDING
     */
    static readonly SORT_DIRECTION_ASCENDING: 1

    /**
     * Sorting parameter DESCENDING
     */
    static readonly SORT_DIRECTION_DESCENDING: 2

    /**
     * Sorting parameter NO_SORT - will remove a sorting condition
     */
    static readonly SORT_DIRECTION_NONE: 0

    /**
     * The number of search results found by this search.
     */
    readonly count  :  number

    /**
     * Identifies if the query is emtpy when no search term, search parameter or refinement was specified for the search. In case also no result is returned. This "empty" is different to a query with a specified query and with an empty result.
     */
    readonly emptyQuery  :  boolean

    /**
     * The method returns true, if this search is refined by at least one attribute.
     */
    readonly refinedByAttribute  :  boolean

    /**
     * Identifies if this was a refined search. A search is a refined search if at least one refinement is part of the query.
     */
    readonly refinedSearch  :  boolean

    /**
     * The search phrase used in this search.
     */
    searchPhrase  :  string


}


export = SearchModel;
