import Product = require('./Product');

declare class VariationGroup extends Product {
    masterProduct  :  Product
}

export = VariationGroup;
