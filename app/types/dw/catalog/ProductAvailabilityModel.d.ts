import ProductInventoryRecord = require('./ProductInventoryRecord');
import ProductAvailabilityLevels = require('./ProductAvailabilityLevels');

declare class ProductAvailabilityModel {
    static AVAILABILITY_STATUS_BACKORDER  :  string;
    static AVAILABILITY_STATUS_IN_STOCK  :  string;
    static AVAILABILITY_STATUS_NOT_AVAILABLE  :  string;
    static AVAILABILITY_STATUS_PREORDER  :  string;
    availability  :  number;
    availabilityStatus  :  string;
    inStock  :  boolean;
    inventoryRecord  :  ProductInventoryRecord | null;
    orderable  :  boolean;
    SKUCoverage  :  number;
    timeToOutOfStock  :  number;


}

export = ProductAvailabilityModel;
