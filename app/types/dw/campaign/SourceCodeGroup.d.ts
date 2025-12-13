import ExtensibleObject = require('../object/ExtensibleObject')
import Collection = require('../util/Collection')
import PriceBook = require('../catalog/PriceBook')
import CustomAttributes = require('../object/CustomAttributes');

declare global {
    module ICustomAttributes {
        interface SourceCodeGroup extends CustomAttributes{
        }
    }
}

declare class SourceCodeGroup extends ExtensibleObject<ICustomAttributes.SourceCodeGroup> {
    ID  :  string
    priceBooks  :  Collection<PriceBook>

}

export = SourceCodeGroup
