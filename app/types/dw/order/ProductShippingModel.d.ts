import ShippingMethod = require('./ShippingMethod');
import Collection = require('../util/Collection');
import ProductShippingCost = require('./ProductShippingCost');
/**
 * Instances of ProductShippingModel provide access to product-level shipping information, such as applicable or inapplicable shipping methods and shipping cost defined for the product for a specified shipping method. 
Use ShippingMgr.getProductShippingModel(Product) to get the shipping model for a specific product
 */
declare class ProductShippingModel {

    /**
     * The active applicable shipping methods for the product related to this shipping model, i.e. shipping methods the product can be shipped with. A product can be shipping with a shipping methods if the shipping method is not explicitely marked as inapplicable for this product.
     */
    readonly applicableShippingMethods  :  Collection<ShippingMethod>

    /**
     * The active inapplicable shipping methods for the product related to this shipping model, i.e. shipping methods the product cannot be shipped with. A product cannot be shipping with a shipping methods if the shipping method is explicitely marked as inapplicable for this product.
     */
    readonly inapplicableShippingMethods  :  Collection<ShippingMethod>

    /**
     * The active shipping methods for which either any fixed-price or surcharge product-level shipping cost is defined for the specified product. 
    Note that this can include inapplicable shipping methods (see getInapplicableShippingMethods()).
    */
    readonly shippingMethodsWithShippingCost  :  Collection<ShippingMethod>


}

export = ProductShippingModel;
