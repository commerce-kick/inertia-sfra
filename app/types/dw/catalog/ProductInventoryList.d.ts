import ExtensibleObject = require('../object/ExtensibleObject')
import Product = require('./Product')
import ProductInventoryRecord = require('./ProductInventoryRecord')
import CustomAttributes = require('../object/CustomAttributes');

declare global {
    module ICustomAttributes {
        interface ProductInventoryList extends CustomAttributes{
        }
    }
}

declare class ProductInventoryList extends ExtensibleObject<ICustomAttributes.ProductInventoryList> {
    defaultInStockFlag  :  boolean
    description  :  string
    ID  :  string
}

export = ProductInventoryList;
