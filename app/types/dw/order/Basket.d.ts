import LineItemCtnr = require('./LineItemCtnr');
import Status = require('../system/Status');
import Order = require('./Order');
import CustomAttributes = require('../object/CustomAttributes');

declare global {
    module ICustomAttributes {
        interface Basket extends CustomAttributes{
        }
    }
}

/**
 * The Basket class represents a shopping cart.
 */
declare class Basket extends LineItemCtnr<ICustomAttributes.Basket> {
    /**
     * Returns if the basket was created by an agent.

    An agent basket is created by an agent on behalf of the customer in comparison to a storefront basket which is created by the customer e.g. in the storefront. An agent basket can be created with BasketMgr.createAgentBasket().
    */
    readonly agentBasket  :  boolean

    /**
     * The timestamp when the inventory for this basket expires.

    It will return null for the following reasons:

        - No reservation for the basket was done
        - Reservation is outdated meaning the timestamp is in the past

    Please note that the expiry timestamp will not always be valid for the whole basket. It will not be valid for new items added or items whose quantity has changed after the reservation was done.
    */
    readonly inventoryReservationExpiry  :  Date | null

    /**
     * The order that this basket represents if the basket is being used to edit an order, otherwise this method returns null.
     */
    readonly orderBeingEdited  :  Order  |  null

    /**
     * The number of the order that this basket represents if the basket is being used to edit an order, otherwise this method returns null.
     */
    readonly orderNoBeingEdited  :  string | null

    private constructor();


}

export = Basket;
