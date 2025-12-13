import Quantity = require('../value/Quantity');
import ShippingOrderItem = require("./ShippingOrderItem");
import TrackingInfo = require('./TrackingInfo');

declare class TrackingRef {
    private constructor();
    /**
     * Gets the quantity, the shipping order item is assigned to the tracking info.
     */
    quantity  :  Quantity

    /**
     * Gets the shipping order item which is assigned to the tracking info.
     */
    readonly shippingOrderItem  :  ShippingOrderItem

    /**
     * Gets the tracking info, the shipping order item is assigned to.
     */
    readonly trackingInfo  :   TrackingInfo


}

export = TrackingRef;
