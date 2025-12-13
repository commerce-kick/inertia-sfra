import ExtensibleObject = require('../object/ExtensibleObject')
import CustomAttributes = require('../object/CustomAttributes');

declare global {
    module ICustomAttributes {
        interface ProductOptionValue extends CustomAttributes{
        }
    }
}

declare class ProductOptionValue extends ExtensibleObject<ICustomAttributes.ProductOptionValue> {
    description  :  string
    displayValue  :  string
    ID  :  string
    productIDModifier  :  string


}

export = ProductOptionValue;
