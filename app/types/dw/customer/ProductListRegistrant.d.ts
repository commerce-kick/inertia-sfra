import ExtensibleObject = require('../object/ExtensibleObject');
import CustomAttributes = require('../object/CustomAttributes');

declare global {
    module ICustomAttributes {
        interface ProductListRegistrant extends CustomAttributes {
        }
    }
}

declare class ProductListRegistrant extends ExtensibleObject<ICustomAttributes.ProductListRegistrant> {
    email: string;
    firstName: string;
    lastName: string;
    role: string;

}

export = ProductListRegistrant;
