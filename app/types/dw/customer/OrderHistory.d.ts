import SeekableIterator = require('../util/SeekableIterator');
import Order = require('../order/Order');

/**
 * The class provides access to past orders of the customer.
 */
declare class OrderHistory {
    /**
     * The number of orders the customer has placed in the store. If the customer is anonymous, this method always returns zero. If an active data record is available for this customer, the orders count will be retrieved from this, otherwise a real-time query will be used to get the count.
     */
    readonly orderCount  :  number;


    private constructor()


}

export = OrderHistory;
