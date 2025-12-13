import Catalog = require('./Catalog');
import List = require('../util/List');
import Collection = require('../util/Collection');
import SortingRule = require('./SortingRule');
import SortingOption = require('./SortingOption');
import Category = require('./Category');

/**
 * Provides helper methods for getting categories.
 */
declare class CatalogMgr {
    /**
     * The catalog of the current site or null if no catalog is assigned to the site.
     */
    static readonly siteCatalog  :  Catalog | null

    /**
     * A list containing the sorting options configured for this site.
     */
    static readonly sortingOptions  :  List<SortingOption>

    /**
     * A collection containing all of the sorting rules for this site.
     */
    static readonly sortingRules  :  Collection<SortingRule>


}

export = CatalogMgr;
