"use strict";

var BaseData = require("../BaseData");
var CartLineItemData = require("./CartLineItemData");
var CartTotalsData = require("./CartTotalsData");
var CheckoutBillingData = require("./CheckoutBillingData");
var CheckoutShipmentData = require("./CheckoutShipmentData");

/**
 * The basket as checkout reads it, and the answer every checkout route gives.
 *
 * Base re-renders its whole `OrderModel` from every one of the eleven
 * checkout JSON routes — submitting an email, choosing a shipping method,
 * saving a billing address — because each of them can move the totals. That
 * is exactly the shape of the cart wave's `CartData`, one stage further on,
 * so this is one DTO answered by all of them rather than eleven ad-hoc bags.
 *
 * The lines and the totals *are* the cart wave's: `CartLineItemData` and
 * `CartTotalsData` read the same product-line-item and totals models the
 * basket already gave them, so the bag and the checkout print the same
 * numbers from the same code.
 *
 * Dropped from base's model: `resources` (a bag of pre-pluralized English
 * strings), `steps` (which of the four stages base's jQuery considered
 * reachable — the page derives that from the basket itself), and
 * `productQuantityTotal` where the totals already carry the count.
 */
var CheckoutOrderData = BaseData.extend({
  schema: {
    /** @type {ICartLineItemData[]} the lines being ordered */
    items: {
      of: CartLineItemData,
      transform: function (items) {
        return (items || []).map(CartLineItemData.fromModel);
      },
      default: function () {
        return [];
      },
    },
    /** @type {number} total quantity across every line */
    numItems: { type: "number", default: 0 },
    /** @type {ICartTotalsData} the money column */
    totals: {
      of: CartTotalsData,
      transform: function (totals) {
        return CartTotalsData.fromModel(totals);
      },
      default: null,
    },
    /** @type {ICheckoutShipmentData[]} the shipments — one, unless multi-ship is on */
    shipping: {
      of: CheckoutShipmentData,
      transform: function (shipments) {
        return (shipments || []).map(CheckoutShipmentData.fromModel);
      },
      default: function () {
        return [];
      },
    },
    /** @type {ICheckoutBillingData} the billing address and what is paying */
    billing: {
      of: CheckoutBillingData,
      transform: CheckoutBillingData.fromModel,
      default: null,
    },
    /** @type {string} the email the order confirmation goes to */
    orderEmail: { type: "string", default: "" },
    /** @type {boolean} whether the basket is being shipped to more than one address */
    usingMultiShipping: { type: "boolean", default: false },
    /** @type {boolean} whether every shipment has an address a method can serve */
    shippable: { type: "boolean", default: false },
  },
});

/**
 * Map base's checkout OrderModel to a plain CheckoutOrderData object.
 * @param {Object} model - SFRA OrderModel built with containerView "basket"
 * @returns {Object} plain CheckoutOrderData object
 */
CheckoutOrderData.fromModel = function (model) {
  var items = model && model.items;

  return CheckoutOrderData.from({
    items: items && items.items,
    numItems: items && items.totalQuantity,
    totals: model && model.totals,
    shipping: model && model.shipping,
    billing: model && model.billing,
    orderEmail: model && model.orderEmail,
    usingMultiShipping: model && model.usingMultiShipping,
    shippable: model && model.shippable,
  });
};

module.exports = CheckoutOrderData;
