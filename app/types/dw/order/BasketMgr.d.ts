import Basket = require('./Basket');
import List = require('../util/List');
import Order = require('./Order');

/**
 * Provides static helper methods for managing baskets.
 */
declare class BasketMgr {
    /**
     * Retrieve all open baskets for the logged in customer.
    The returned list contains all agent baskets created with createAgentBasket() and the current storefront basket which can also be retrieved with getCurrentBasket(). This method will result in an exception if called by a user without permission Create_Order_On_Behalf_Of or if no customer is logged in the session.

    Please notice that baskets are invalidated after a certain amount of time and may not be returned anymore.
    */
    readonly baskets  :  List<Basket>

    /**
     * This method returns the current valid basket of the session customer or null if no current valid basket exists.
    The methods getCurrentBasket() and getCurrentOrNewBasket() work based on the selected basket persistence, which can be configured in the Business Manager site preferences / baskets section. A basket is valid for the configured basket lifetime.

    The current basket, if one exists, is usually updated by the method. In particular the last-modified date is updated.
    */
    readonly currentBasket  :  Basket | null

    /**
     * This method returns the current valid basket of the session customer or creates a new one if no current valid basket exists. See getCurrentBasket() for more details.
     */
    readonly currentOrNewBasket  :  Basket

    /**
     * This method returns the stored basket of the session customer or null if none is found. A stored basket is returned in the following situation: - During one visit, a customer-X logs in and receives a basket-A - In a later visit, a second basket-B is created for an anonymous customer who then logs in as customer-X. In this case basket-B is reassigned to him and basket-A is accessible as the stored basket. Now it is possible to merge the information from the stored basket to the active basket.
     */
    readonly storedBasket  :  Basket | null


}

export = BasketMgr;
