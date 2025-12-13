import Category = require('./Category');

declare class CategoryLink {
    static LINKTYPE_ACCESSORY  :  number;
    static LINKTYPE_CROSS_SELL  :  number;
    static LINKTYPE_OTHER  :  number;
    static LINKTYPE_SPARE_PART  :  number;
    static LINKTYPE_UP_SELL  :  number;

    sourceCategory  :  Category;
    targetCategory  :  Category;
    typeCode  :  number;


}

export = CategoryLink;
