import Product = require('./Product');

declare class Variant extends Product {
    masterProduct: Product
}

export = Variant;
