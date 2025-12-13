import Collection = require('../util/Collection');
import SearchRefinementDefinition = require('./SearchRefinementDefinition');
import SearchRefinementValue = require('./SearchRefinementValue');

declare class SearchRefinements {

    /**
     * Flag for an ascending sort.
     */
    static readonly ASCENDING  :  number

    /**
     * Flag for a descending sort.
     */
    static readonly DESCENDING  :  number

    /**
     * Flag for sorting on value count.
     */
    static readonly SORT_VALUE_COUNT  :  number

    /**
     * Flag for sorting on value name.
     */
    static readonly SORT_VALUE_NAME  :  number

    /**
     * A sorted list of refinement definitions that are appropriate for the deepest common category (or deepest common folder) of the search result. The method concatenates the sorted refinement definitions per category starting at the root category until reaching the deepest common category. The method does not filter out refinement definitions that do not provide values for the current search result and can therefore also be used on empty search results.
     */
    readonly allRefinementDefinitions  :  Collection<SearchRefinementDefinition>

    /**
     * A sorted list of refinement definitions that are appropriate for the deepest common category (or deepest common folder) of the search result. The method concatenates the sorted refinement definitions per category starting at the root category until reaching the deepest common category. The method also filters out refinement definitions that do not provide any values for the current search result.
     */
    readonly refinementDefinitions  :  Collection<SearchRefinementDefinition>


    protected constructor();


}

export = SearchRefinements;
