import Product = require('./Product');

declare class ProductLink {
    static LINKTYPE_ACCESSORY  :  number;
    static LINKTYPE_ALT_ORDERUNIT  :  number;
    static LINKTYPE_CROSS_SELL  :  number;
    static LINKTYPE_NEWER_VERSION  :  number;
    static LINKTYPE_OTHER  :  number;
    static LINKTYPE_REPLACEMENT  :  number;
    static LINKTYPE_SPARE_PART  :  number;
    static LINKTYPE_UP_SELL  :  number;

    sourceProduct  :  Product;
    targetProduct  :  Product;
    typeCode  :  number;

} 

export = ProductLink;
