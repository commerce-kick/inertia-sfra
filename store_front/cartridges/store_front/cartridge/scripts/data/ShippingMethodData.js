"use strict";

var BaseData = require("../BaseData");

/**
 * One shipping method a shipment may be assigned.
 *
 * Base's cart page showed these in a <select> and posted the chosen ID back
 * to Cart-SelectShippingMethod; the estimate the shopper sees is the pair
 * (displayName, estimatedArrivalTime) with the cost beside it. `shippingCost`
 * and `selected` only exist when the model was built against a shipment —
 * which is how the cart builds it — so both default rather than being
 * optional on the wire.
 */
var ShippingMethodData = BaseData.extend({
  schema: {
    /** @type {string} shipping method ID, the value Cart-SelectShippingMethod takes */
    id: { type: "string", default: "" },
    /** @type {string} display name */
    displayName: { type: "string", default: "" },
    /** @type {string} merchant description, empty when unset */
    description: { type: "string", default: "" },
    /** @type {string} estimated arrival copy from the method's custom attribute */
    estimatedArrivalTime: { type: "string", default: "" },
    /** @type {string} formatted cost of this method for this shipment */
    shippingCost: { type: "string", default: "" },
    /** @type {boolean} whether this method is the shipment's current choice */
    selected: { type: "boolean", default: false },
    /** @type {boolean} whether this is the site's default method */
    isDefault: { type: "boolean", default: false },
  },
});

/**
 * Map a shipping method model to a plain ShippingMethodData object.
 * @param {Object} method - SFRA ShippingMethodModel
 * @returns {Object} plain ShippingMethodData object
 */
ShippingMethodData.fromModel = function (method) {
  return ShippingMethodData.from({
    id: method.ID,
    displayName: method.displayName,
    description: method.description,
    estimatedArrivalTime: method.estimatedArrivalTime,
    shippingCost: method.shippingCost,
    selected: method.selected,
    isDefault: method.default,
  });
};

module.exports = ShippingMethodData;
