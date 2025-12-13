import ShippingMethod = require('./ShippingMethod');
import Collection = require('../util/Collection');
import ShipmentShippingCost = require('./ShipmentShippingCost');

/**
 * Instances of ShipmentShippingModel provide access to shipment-level shipping information, such as applicable and inapplicable shipping methods and shipping cost. 
Use ShippingMgr.getShipmentShippingModel(Shipment) to get the shipping model for a specific shipment.
 */
declare class ShipmentShippingModel {

/**
 * The active applicable shipping methods for the shipment related to this shipping model. A shipping method is applicable for a shipment if it does not exclude any of the products in the shipment, and does not exclude the shipment's shipping address, if this is set. Also checks that the the shipment customer belongs to an assigned customer group of the shipment (if any are assigned).
 */
readonly applicableShippingMethods  :  Collection<ShippingMethod>

/**
 * The active inapplicable shipping methods for the shipment related to this shipping model. A shipping method is inapplicable for a shipment if it is inapplicable for at least one product contained in the shipment, or the shipping address is excluded by the shipping method, or the shipping method is restricted to customer groups that the shipment customer is not a part of.
 */
readonly inapplicableShippingMethods  :  Collection<ShippingMethod>


private constructor();


}

export = ShipmentShippingModel;
