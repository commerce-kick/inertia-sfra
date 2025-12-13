import ExtensibleObject = require('../object/ExtensibleObject');
import MarkupText = require('../content/MarkupText');
import Product = require('./Product');
import Category = require('./Category');
import MediaFile = require('../content/MediaFile');
import CustomAttributes = require('../object/CustomAttributes');

declare global {
    module ICustomAttributes {
        interface CategoryAssignment extends CustomAttributes{
        }
    }
}

declare class CategoryAssignment extends ExtensibleObject<ICustomAttributes.CategoryAssignment> {
    calloutMsg  :  MarkupText;
    category  :  Category;
    image  :  MediaFile;
    longDescription  :  MarkupText;
    name  :  string;
    product  :  Product;
    shortDescription  :  MarkupText;

}

export =  CategoryAssignment;
