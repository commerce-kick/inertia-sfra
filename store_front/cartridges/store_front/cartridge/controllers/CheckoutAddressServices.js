"use strict";

/**
 * @namespace CheckoutAddressServices
 */

const server = require("server");
server.extend(module.superModule);

var answerCheckout = require("*/cartridge/scripts/helpers/answerCheckout").answerCheckout;

/**
 * CheckoutAddressServices-CreateNewAddress: split a line onto a shipment of
 * its own.
 *
 * Multi-ship only, and typed without a surface for the same reason 6.8 is:
 * base invokes it when a shopper assigns one product to a second address,
 * which the port's single-shipment checkout never asks. It creates the
 * shipment, moves the line onto it, gives it a method and recalculates — all
 * base's, all kept — and answers the re-rendered order plus the new
 * shipment's UUID, which the typed order carries as `shipping[].uuid`.
 *
 * @formParam productLineItemUUID required string the line being moved to its own shipment
 */
server.append("CreateNewAddress", function (req, res, next) {
  answerCheckout(res);

  return next();
});

/**
 * CheckoutAddressServices-AddNewAddress: save an address against one shipment.
 *
 * Multi-ship only, as base's own comment says. Its field errors are the
 * shipping address form's, which `answerCheckout` already lands per field, so
 * a multi-ship UI would render them exactly as the single-shipment stage
 * renders its own.
 *
 * @formParam productLineItemUUID required string the line whose shipment is being addressed
 * @formParam shipmentUUID optional string the shipment being addressed
 * @formParam originalShipmentUUID optional string the shipment it was split from
 * @formParam shipmentSelector optional string the chosen shipment or saved address
 * @formParam dwfrm_shipping_shippingAddress_addressFields_firstName required string given name
 * @formParam dwfrm_shipping_shippingAddress_addressFields_lastName required string family name
 * @formParam dwfrm_shipping_shippingAddress_addressFields_address1 required string street line
 * @formParam dwfrm_shipping_shippingAddress_addressFields_address2 optional string second street line
 * @formParam dwfrm_shipping_shippingAddress_addressFields_city required string city
 * @formParam dwfrm_shipping_shippingAddress_addressFields_states_stateCode required string state or province code
 * @formParam dwfrm_shipping_shippingAddress_addressFields_postalCode required string postal code
 * @formParam dwfrm_shipping_shippingAddress_addressFields_country required string ISO country code
 * @formParam dwfrm_shipping_shippingAddress_addressFields_phone required string phone number
 * @formParam dwfrm_shipping_shippingAddress_shippingMethodID required string the chosen shipping method
 */
server.append("AddNewAddress", function (req, res, next) {
  this.on("route:BeforeComplete", function (beforeReq, beforeRes) {
    answerCheckout(beforeRes);
  });

  return next();
});

module.exports = server.exports();
