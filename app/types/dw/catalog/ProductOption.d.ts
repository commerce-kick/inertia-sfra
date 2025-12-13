import ExtensibleObject = require('../object/ExtensibleObject')
import MediaFile = require('../content/MediaFile')
import Collection = require('../util/Collection')
import ProductOptionValue = require('./ProductOptionValue')
import CustomAttributes = require('../object/CustomAttributes');

declare global {
    module ICustomAttributes {
        interface ProductOption extends CustomAttributes{
        }
    }
}

declare class ProductOption extends ExtensibleObject<ICustomAttributes.ProductOption> {
    defaultValue  :  ProductOptionValue
    description  :  string
    displayName  :  string
    htmlName  :  string
    ID  :  string
    image  :  MediaFile
    optionValues  :  Collection<ProductOptionValue>

}

export = ProductOption
