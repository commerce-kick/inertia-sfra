import ExtensibleObject = require('../object/ExtensibleObject');
import MarkupText = require('../content/MarkupText');
import Catalog = require('./Catalog');
import Category = require('./Category');
import MediaFile = require('../content/MediaFile');
import Product = require('./Product');
import CustomAttributes = require('../object/CustomAttributes');

declare global {
    module ICustomAttributes {
        interface Recommendation extends CustomAttributes{
        }
    }
}

declare class Recommendation extends ExtensibleObject<ICustomAttributes.Recommendation> {
    calloutMsg  :  MarkupText;
    catalog  :  Catalog;
    image  :  MediaFile;
    longDescription  :  MarkupText;
    name  :  string;
    recommendationType  :  number;
    recommendedItem  :  Product;
    recommendedItemID  :  string;
    shortDescription  :  MarkupText;
    sourceItem : Product | Category;
    sourceItemID  :  string;

}

export = Recommendation;
