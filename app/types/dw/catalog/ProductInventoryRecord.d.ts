import ExtensibleObject = require('../object/ExtensibleObject');
import Quantity = require('../value/Quantity');

import CustomAttributes = require('../object/CustomAttributes');

declare global {
    module ICustomAttributes {
        interface ProductInventoryRecord extends CustomAttributes{
        }
    }
}

declare class ProductInventoryRecord extends ExtensibleObject<ICustomAttributes.ProductInventoryRecord> {
    allocation  :  Quantity;
    allocationResetDate  :  Date;
    ATS  :  Quantity;
    backorderable  :  boolean;
    inStockDate  :  Date;
    perpetual  :  boolean;
    preorderable  :  boolean;
    preorderBackorderAllocation  :  Quantity;
    reserved  :  Quantity;
    stockLevel  :  Quantity;
    turnover  :  Quantity;


}

export = ProductInventoryRecord;
