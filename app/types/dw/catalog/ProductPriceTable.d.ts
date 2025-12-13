import Collection = require('../util/Collection')
import Quantity = require('../value/Quantity')
import Money = require('../value/Money')
import PriceBook = require('./PriceBook')


declare class ProductPriceTable {
    quantities  :  Collection<Quantity>

}

export = ProductPriceTable;
