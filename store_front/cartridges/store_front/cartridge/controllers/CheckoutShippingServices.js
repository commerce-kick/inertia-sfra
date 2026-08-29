"use strict";

/**
 * @namespace CheckoutShippingServices
 */

const server = require("server");
server.extend(module.superModule);

var answerCheckout = require("*/cartridge/scripts/helpers/answerCheckout").answerCheckout;

/**
 * CheckoutShippingServices-SubmitShipping: where the order goes and how.
 *
 * The shipping stage's one submit. Base validates the address, writes it onto
 * the shipment, applies the chosen method, recalculates the basket and — for
 * a shopper who ticked "use as billing address" — copies it onto billing too.
 * All of it stays; this appends a `route:BeforeComplete` after base's and
 * retypes the answer, so the totals that changed come back with it.
 *
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
 * @formParam dwfrm_shipping_shippingAddress_shippingAddressUseAsBillingAddress optional boolean bill to the same address
 * @formParam shipmentUUID optional string which shipment, when the basket has more than one
 */
server.append("SubmitShipping", function (req, res, next) {
  this.on("route:BeforeComplete", function (beforeReq, beforeRes) {
    answerCheckout(beforeRes);
  });

  return next();
});

/**
 * CheckoutShippingServices-SelectShippingMethod: choose how it ships.
 *
 * The checkout counterpart of Cart-SelectShippingMethod (2.13): the same
 * choice, made where the shipping and tax totals are actually settled. Base
 * recalculates the basket on every change, which is the point — the totals
 * move — so the re-rendered order rides back.
 *
 * This *must* answer from a `route:BeforeComplete` of its own, not from the
 * middleware chain. Base stashes the address on view data during the chain
 * and does the whole transaction in its own BeforeComplete, reading it back
 * from there — so a chain-time answer, which resets view data, takes the
 * address out from under base and its transaction throws "Unable to select
 * shipping Method" on a request that was perfectly good.
 *
 * The routes that answer inline (Get, PlaceOrder, UpdateShippingMethodsList,
 * CreateNewAddress) are the ones whose port steps may answer from the chain;
 * every route that defers, defers here too.
 *
 * @formParam methodID required string the shipping method to apply
 * @formParam shipmentUUID optional string which shipment, when the basket has more than one
 * @formParam firstName optional string the shipment's address — plain names, not the form definition's
 * @formParam lastName optional string see firstName
 * @formParam address1 optional string see firstName
 * @formParam address2 optional string see firstName
 * @formParam city optional string see firstName
 * @formParam stateCode optional string see firstName
 * @formParam postalCode optional string see firstName
 * @formParam countryCode optional string see firstName
 * @formParam phone optional string see firstName
 */
server.append("SelectShippingMethod", function (req, res, next) {
  this.on("route:BeforeComplete", function (beforeReq, beforeRes) {
    answerCheckout(beforeRes);
  });

  return next();
});

/**
 * CheckoutShippingServices-UpdateShippingMethodsList: which methods this
 * address may use.
 *
 * Base calls this as the shopper fills in the address, because what can ship
 * to a postcode is a question only the server can answer. It re-reads the
 * applicable methods and the totals they imply, which is what the typed
 * answer carries.
 *
 * @formParam dwfrm_shipping_shippingAddress_addressFields_postalCode optional string postal code so far
 * @formParam dwfrm_shipping_shippingAddress_addressFields_states_stateCode optional string state or province code so far
 * @formParam dwfrm_shipping_shippingAddress_addressFields_country optional string ISO country code so far
 * @formParam shipmentUUID optional string which shipment, when the basket has more than one
 */
server.append("UpdateShippingMethodsList", function (req, res, next) {
  answerCheckout(res);

  return next();
});

/**
 * CheckoutShippingServices-ToggleMultiShip: ship the basket to more than one
 * address.
 *
 * Typed, with no surface — the same outcome as Cart-Get (2.5) and
 * Cart-AddProductListItem (2.15), and for the same kind of reason. The port's
 * basket is single-shipment (2.1): base only offers this when the site
 * enables multi-ship *and* the basket has more than one line, and the UI
 * behind it is a per-line address assignment the port does not render. The
 * route is part of the storefront's public surface either way, so it answers
 * the typed order like every other checkout route; the caller arrives with a
 * multi-ship UI, if one is ever wanted.
 *
 * @formParam usingMultiShip required boolean whether the basket ships to several addresses
 */
server.append("ToggleMultiShip", function (req, res, next) {
  this.on("route:BeforeComplete", function (beforeReq, beforeRes) {
    answerCheckout(beforeRes);
  });

  return next();
});

module.exports = server.exports();
