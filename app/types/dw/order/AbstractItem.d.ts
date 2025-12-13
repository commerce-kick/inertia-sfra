import Extensible = require('../object/Extensible');
import Money = require('../value/Money');
import LineItem = require('./LineItem');
import Collection = require('../util/Collection');
import TaxItem = require('./TaxItem');
import OrderItem = require('./OrderItem');


/**
 * An item which references, or in other words is based upon, an OrderItem. Provides methods to access the OrderItem, the order LineItem which has been extended, and the Order. In addition it defines methods to access item level prices and the item id. Supports custom-properties.
 */
declare class AbstractItem extends Extensible {
    /**
     * Gross price of item.
     */
    readonly grossPrice  :  Money

    /**
     * The item-id used for referencing between items
     */
    readonly itemID  :  string

    /**
     * The Order Product- or Shipping- LineItem associated with this item. Should never return null.
     */
    readonly lineItem  :  LineItem

    /**
     * Net price of item.
     */
    readonly netPrice  :  Money

    /**
     * The order item extensions related to this item. Should never return null.
     */
    readonly orderItem  :  OrderItem

    /**
     * The order-item-id used for referencing the OrderItem
     */
    readonly orderItemID  :  string

    /**
     * Total tax for item.
     */
    readonly tax  :  Money  

    /**
     * Price of entire item on which tax calculation is based. Same as getNetPrice() or getGrossPrice() depending on whether the order is based on net or gross prices.
     */
    readonly taxBasis  :  Money

    /**
     * Tax items representing a tax breakdown
     */
    readonly taxItems  :  Collection<TaxItem>  


}

export = AbstractItem;
