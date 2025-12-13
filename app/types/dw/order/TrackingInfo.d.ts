import Extensible = require('../object/Extensible');
import Collection = require('../util/Collection');
import TrackingRef = require('./TrackingRef'); 
import ShippingOrder = require('./ShippingOrder');

/**
 * 
Provides basic information about a tracking info. An instance is identified by an ID and can be referenced from n ShippingOrderItems using TrackingRefs. This also allows one ShippingOrderItem to be associated with n TrackingInfo.

See Also:

ShippingOrder.addTrackingInfo(string)
ShippingOrderItem.addTrackingRef(string, Quantity)

 */
declare class TrackingInfo extends Extensible {
    private constructor();

    /**
     * Get the Carrier.
     */
    carrier  :  string

    /**
     * Get the service(ship method) of the used carrier.
     */
    carrierService  :  string

    /**
     * Get the mandatory identifier for this tracking information. The id allows the tracking information to be referenced from TrackingRefs. To support short shipping a shipping-order-item can manage a list of TrackingRefs, each with an optional quantity value allowing individual items to ship in multiple parcels with known item quantity in each.
     */
    readonly ID  :  string  

    /**
     * Get the ship date.
     */
    shipDate  :  Date

    /**
     * Gets the shipping order.
     */
    readonly shippingOrder  :  ShippingOrder

    /**
     * Get the tracking number.
     */
    trackingNumber  :  string

    /**
     * Gets the tracking refs (shipping order items) which are assigned to this tracking info.
     */
    readonly trackingRefs  :  Collection<TrackingRef>

    /**
     * Get the id of the shipping warehouse.
     */
    warehouseID  :  string


}

export = TrackingInfo;
