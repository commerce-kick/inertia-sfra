import Quantity = require('../value/Quantity');

declare class ProductAvailabilityLevels {
    backorder  :  Quantity;
    count  :  number;
    inStock  :  Quantity;
    notAvailable  :  Quantity;
    preorder  :  Quantity;

}

export = ProductAvailabilityLevels;
