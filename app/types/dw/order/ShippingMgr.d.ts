import ShippingMethod = require('./ShippingMethod');
import Collection = require('../util/Collection');
import LineItemCtnr = require('./LineItemCtnr');
import Money = require('../value/Money');
import Product = require('../catalog/Product');
import Shipment = require('./Shipment')
import ProductShippingModel = require('./ProductShippingModel');
import ShipmentShippingModel = require('./ShipmentShippingModel');


/**
 * Provides methods to access the shipping information.
 */
declare class ShippingMgr {
    private constructor();

    /**
     * The active shipping methods of the current site applicable to the session currency and current customer group.
     */
    readonly allShippingMethods  :  Collection<ShippingMethod>

    /**
     * The default shipping method of the current site applicable to the session currency. Does an additional check if there is a base method and if their currencies are the same. Returns NULL if the two currencies are different.
     */
    readonly defaultShippingMethod  :  ShippingMethod


}

export =  ShippingMgr;
