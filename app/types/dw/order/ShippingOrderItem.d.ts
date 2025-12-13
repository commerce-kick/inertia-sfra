import AbstractItem = require('./AbstractItem');
import Quantity = require('../value/Quantity');
import Decimal = require('../util/Decimal');
import EnumValue = require('../value/EnumValue');
import Money = require('../value/Money');
import FilteringCollection = require('../util/FilteringCollection');
import TrackingRef = require('./TrackingRef');

declare class ShippingOrderItem extends AbstractItem {
    static readonly STATUS_CANCELLED: 'CANCELLED'
    static readonly STATUS_CONFIRMED: 'CONFIRMED'
    static readonly STATUS_SHIPPED: 'SHIPPED'
    static readonly STATUS_WAREHOUSE: 'WAREHOUSE'

    /**
     * Price of a single unit before discount application.
     */
    basePrice: Money

    /**
     * Returns null or the parent item.
     */
    parentItem: ShippingOrderItem | null

    /**
     * The quantity of the shipping order item.
     *
     * The Quantity is equal to the related line item quantity.
     */
    quantity: Quantity


    /**
     * The mandatory shipping order number of the related ShippingOrder.
     */
    shippingOrderNumber: string

    /**
     * Gets the order item status.
     *
     * The possible values are STATUS_CONFIRMED, STATUS_WAREHOUSE, STATUS_SHIPPED, STATUS_CANCELLED.
     */
    status: EnumValue<'STATUS_CONFIRMED' | 'STATUS_WAREHOUSE' | 'STATUS_SHIPPED' | 'STATUS_CANCELLED'>


    /**
     * Gets the tracking refs (tracking infos) the shipping order item is assigned to.
     */
    trackingRefs: FilteringCollection<TrackingRef>

    private constructor();


}

export = ShippingOrderItem;
