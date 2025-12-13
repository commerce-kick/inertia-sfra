import Extensible = require('../object/Extensible');
import FilteringCollection = require('../util/FilteringCollection');
import Order = require('../order/Order');
import SumItem = require('./SumItem');


/**
 * Basis for item-based objects stemming from a single Order, with these common properties (Invoice is used as an example):

    - The object has been created from an Order accessible using getOrder()
    - Contains a collection of items, each item related to exactly one OrderItem which in turn represents an extension to one of the order ProductLineItem or one ShippingLineItem. Example: an Invoice has InvoiceItems
    - The items hold various prices which are summed, resulting in a product-subtotal, a service-subtotal and a grand-total, each represented by a SumItem.
    - The object is customizable using custom properties

 */
declare class AbstractItemCtnr extends Extensible {
    /**
     * Created by this user.
     */
    readonly createdBy  :  string

    /**
     * The time of creation.
     */
    readonly creationDate  :  Date

    /**
     * The sum-item representing the grandtotal for all items.
     */
    readonly grandTotal  :  SumItem  

    /**
     * The unsorted collection of items
     */
    readonly items  :  FilteringCollection<any>

    /**
     * The last modification time.
     */
    readonly lastModified  :  Date  

    /**
     * Last modified by this user.
     */
    readonly modifiedBy  :  string  

    /**
     * The Order this object was created for.
     */
    readonly order  :  Order

    /**
     * The sum-item representing the subtotal for product items.
     */
    readonly productSubtotal  :  SumItem  

    /**
     * The sum-item representing the subtotal for service items such as shipping.
     */
    readonly serviceSubtotal  :  SumItem  


}

export = AbstractItemCtnr;
