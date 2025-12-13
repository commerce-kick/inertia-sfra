import Money = require('../value/Money');

/**
 * Represents shipping cost applied to shipments. 
Returned by ShipmentShippingModel.getShippingCost(ShippingMethod).
 */
declare class ShipmentShippingCost {
    /**
     * The shipping amount.
     */
    readonly amount  :  Money

    private constructor();

}

export = ShipmentShippingCost;
