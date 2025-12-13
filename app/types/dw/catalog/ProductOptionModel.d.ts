import Collection = require('../util/Collection')
import Money = require('../value/Money')
import URL = require('../web/URL')
import ProductOption = require('./ProductOption')
import ProductOptionValue = require('./ProductOptionValue')

declare class ProductOptionModel {
    readonly options  :  Collection<ProductOption>

}

export = ProductOptionModel
