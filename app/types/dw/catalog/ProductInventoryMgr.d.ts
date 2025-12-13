import ProductInventoryList = require('./ProductInventoryList');

/**
 * This manager provides access to inventory-related objects.
 */
declare class ProductInventoryMgr {
    private constructor();

    /**
     * The inventory list assigned to the current site or null if no inventory list is assigned to the current site.
     */
    readonly inventoryList : ProductInventoryList | null;


}

export = ProductInventoryMgr;
