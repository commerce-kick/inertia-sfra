"use strict";

var BaseData = require("../BaseData");
var AddressData = require("./AddressData");
var ShippingMethodData = require("./ShippingMethodData");

/**
 * One shipment of the basket at checkout: where it goes and how.
 *
 * Base's ShippingModel carries the same four facts plus the shipment's own
 * line items, which only a multi-shipment checkout needs — the port's basket
 * is single-shipment (see 2.1), so the lines are read once at the order level
 * instead of once per shipment.
 *
 * `matchingAddressId` is base's own: the ID of the saved address this
 * shipping address is equivalent to, which is what lets the address selector
 * open on the entry the shopper already chose rather than on "new address".
 */
var CheckoutShipmentData = BaseData.extend({
  schema: {
    /** @type {string} the shipment's UUID — the handle the shipping routes take */
    uuid: { type: "string", default: "" },
    /** @type {IAddressData} where this shipment goes, null before one is entered */
    shippingAddress: {
      of: AddressData,
      transform: AddressData.fromModel,
      default: null,
    },
    /** @type {IShippingMethodData} the method chosen for it, null before one is chosen */
    selectedShippingMethod: {
      of: ShippingMethodData,
      transform: function (method) {
        return method ? ShippingMethodData.fromModel(method) : null;
      },
      default: null,
    },
    /** @type {IShippingMethodData[]} the methods this address may use */
    applicableShippingMethods: {
      of: ShippingMethodData,
      transform: function (methods) {
        return (methods || []).map(ShippingMethodData.fromModel);
      },
      default: function () {
        return [];
      },
    },
    /** @type {string} ID of the saved address this one matches, empty when it matches none */
    matchingAddressId: { type: "string", default: "" },
  },
});

/**
 * Map an SFRA shipping model to a plain CheckoutShipmentData object.
 * @param {Object} model - SFRA ShippingModel
 * @returns {Object} plain CheckoutShipmentData object
 */
CheckoutShipmentData.fromModel = function (model) {
  return CheckoutShipmentData.from({
    uuid: model && model.UUID,
    shippingAddress: model && model.shippingAddress,
    selectedShippingMethod: model && model.selectedShippingMethod,
    applicableShippingMethods: model && model.applicableShippingMethods,
    // Base answers `false` rather than a missing value when nothing matched.
    matchingAddressId:
      model && typeof model.matchingAddressId === "string" ? model.matchingAddressId : "",
  });
};

module.exports = CheckoutShipmentData;
