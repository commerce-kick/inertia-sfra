import Store = require('./Store');
import Collection = require('../util/Collection');
import StoreGroup = require('./StoreGroup');
import LinkedHashMap = require('../util/LinkedHashMap');

/**
 * Provides helper methods for getting stores based on id and querying for stores based on geolocation.
 */
declare class StoreMgr {
    private constructor();

    /**
     * All the store groups of the current site.
     */
    readonly allStoreGroups  :  Collection<StoreGroup>


}

export = StoreMgr;
