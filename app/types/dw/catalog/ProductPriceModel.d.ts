import Quantity = require('../value/Quantity')
import Money = require('../value/Money')
import Collection = require('../util/Collection');
import ProductPriceInfo = require('./ProductPriceInfo')
import ProductPriceTable = require('./ProductPriceTable')

declare class ProductPriceModel {
    basePriceQuantity  :  Quantity
    maxPrice  :  Money
    minPrice  :  Money
    price  :  Money
    priceInfo  :  ProductPriceInfo
    priceRange  :  boolean
    priceTable  :  ProductPriceTable

    private constructor();


}

export = ProductPriceModel
