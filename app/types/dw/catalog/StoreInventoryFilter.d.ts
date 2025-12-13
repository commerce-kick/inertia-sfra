import List = require('../util/List');
import StoreInventoryFilterValue = require('./StoreInventoryFilterValue');

/**
 * Important Note: This API class is not GA and is currently a pilot/beta service as defined by the customer's main services agreement and provided as-is. If you are not part of the pilot/beta program, the API class will throw an exception. Contact your customer success representative for more information.
 *
 * This class represents a store inventory filter, which can be used at ProductSearchModel.setStoreInventoryFilter(StoreInventoryFilter) to filter the search result by one or more store inventories. Compared to the default parameter 'ilids' (Inventory List IDs) the store inventory filter allows a customization of the parameter name and the inventory list ID parameter values for the URL generations via all URLRefine and URLRelax methods.
 */
declare class StoreInventoryFilter {

    /**
     * The semantic URL parameter of this StoreInventoryFilter.
     */
    readonly semanticURLParameter: string;

    /**
     * A list of StoreInventoryFilterValue instances used by this StoreInventoryFilter.
     */
    readonly storeInventoryFilterValues: List<StoreInventoryFilterValue>;


}

export = StoreInventoryFilter;
