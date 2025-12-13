import Money = require('../value/Money');

/**
 * Instances of ProductShippingCost represent product specific shipping costs. 
Use ProductShippingModel.getShippingCost(ShippingMethod) to get the shipping cost for a specific product.
 */
declare class ProductShippingCost {
    /**
     * The shipping amount.
     */
    readonly amount  :  Money;

    /**
     * Returns true if shipping cost is a fixed-price shipping cost, and false if surcharge shipping cost.
     */
    readonly fixedPrice  :  boolean

    /**
     * Returns true if shipping cost is a surcharge to the shipment shipping cost, and false if fixed-price shipping cost.
     */
    readonly surcharge  :  boolean

    private constructor();


}

export = ProductShippingCost;
