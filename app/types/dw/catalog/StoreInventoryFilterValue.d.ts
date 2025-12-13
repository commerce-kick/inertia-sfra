
/**
 * This class represents a store inventory filter value, which contains the semantic store inventory value and the related real inventory list ID.
 */
declare class StoreInventoryFilterValue {

    /**
     * The related real inventory list ID of this StoreInventoryFilterValue.
     */
    readonly inventoryListID: string;

    /**
     * The semantic store inventory value of this StoreInventoryFilterValue.
     */
    readonly semanticStoreInventoryValue: string;


}

export = StoreInventoryFilterValue;
