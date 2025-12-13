import ExtensibleObject = require('../object/ExtensibleObject');
import Category = require('./Category');
import CustomAttributes = require('../object/CustomAttributes');

declare global {
    module ICustomAttributes {
        interface Catalog extends CustomAttributes{
        }
    }
}

declare class Catalog extends ExtensibleObject<ICustomAttributes.Catalog> {
    description  :  string;
    displayName  :  string;
    ID  :  string;
    root  :  Category;

}

export = Catalog;
