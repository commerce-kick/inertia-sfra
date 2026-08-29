"use strict";

var BaseData = require("../BaseData");
var CartLineItemData = require("./CartLineItemData");
var CartTotalsData = require("./CartTotalsData");
var ShippingMethodData = require("./ShippingMethodData");

/**
 * The basket, as every cart surface reads it: the Cart-Show page prop, the
 * bag flyout, and the answer of every cart mutation that base replied to
 * with a fresh `new CartModel(basket)`.
 *
 * Base's cart model also carried an `actionUrls` bag, a `resources` bag of
 * pre-pluralized English strings, and `numOfShipments`. The URLs come from
 * the generated route helpers instead; the strings are written inline in
 * English by the components; and `numOfShipments` only ever gated a
 * multi-shipment cart page that base never shipped — the cart is
 * single-shipment, which is why `shippingMethods` is the default shipment's
 * list rather than a list per shipment.
 *
 * `approachingDiscounts` is the one place this diverges in substance. Base
 * assembled a finished sentence on the server ("Spend $20.00 more to get
 * free shipping") out of a resource template, a formatted distance and the
 * promotion's callout. UI copy is English-only and written in the component,
 * so the two facts arrive separately and the sentence is composed there.
 */
var CartData = BaseData.extend({
  schema: {
    /** @type {ICartLineItemData[]} the lines of the basket */
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
    /** @type {IShippingMethodData[]} methods available to the default shipment */
    shippingMethods: {
      of: ShippingMethodData,
      transform: function (methods) {
        return (methods || []).map(ShippingMethodData.fromModel);
      },
      default: function () {
        return [];
      },
    },
    /** @type {string} ID of the shipment's current shipping method, empty when none is set */
    selectedShippingMethod: { type: "string", default: "" },
    /** @type {Array<{distance: string, calloutMsg: string}>} promotions the basket is close to earning */
    approachingDiscounts: {
      transform: function (discounts) {
        return (discounts || []).map(function (discount) {
          return {
            distance: discount.distance || "",
            calloutMsg: discount.calloutMsg || "",
          };
        });
      },
      default: function () {
        return [];
      },
    },
    /** @type {boolean} true when any line earned a bonus product */
    hasBonusProduct: { type: "boolean", default: false },
    /** @type {{error: boolean, message: string}} the basket validation hook's verdict; checkout is barred while error is true */
    valid: {
      transform: function (valid) {
        return {
          error: Boolean(valid && valid.error),
          message: (valid && valid.message) || "",
        };
      },
      default: function () {
        return { error: false, message: "" };
      },
    },
  },
});

/**
 * Map a basket to a plain CartData object.
 *
 * `model` is base's cart model — on Cart-Show it is already sitting in view
 * data, on the JSON routes it is what base answered with. `basket` is only
 * needed for the approaching discounts, which base pre-formatted; passing it
 * is optional, and without it the basket simply reports none.
 *
 * @param {Object} model - SFRA cart model
 * @param {dw.order.Basket} [basket] - the basket the model was built from
 * @returns {Object} plain CartData object
 */
CartData.fromModel = function (model, basket) {
  var shipment = (model && model.shipments && model.shipments[0]) || {};

  return CartData.from({
    items: model && model.items,
    numItems: model && model.numItems,
    totals: model && model.totals,
    shippingMethods: shipment.shippingMethods,
    selectedShippingMethod: shipment.selectedShippingMethod,
    approachingDiscounts: CartData.approachingDiscounts(basket),
    hasBonusProduct: model && model.hasBonusProduct,
    valid: model && model.valid,
  });
};

/**
 * The order- and shipping-level promotions the basket is close to earning,
 * as the two facts that make the sentence: how much further to go, and what
 * the promotion grants.
 *
 * Base read the same pair off the discount plan and formatted a sentence
 * from them; this keeps them apart. A basket with no line items has no plan
 * worth asking for.
 *
 * @param {dw.order.Basket} basket - the current basket, or null
 * @returns {Array<{distance: string, calloutMsg: string}>} approaching promotions
 */
CartData.approachingDiscounts = function (basket) {
  if (!basket || !basket.productLineItems || !basket.productLineItems.length) {
    return [];
  }

  var PromotionMgr = require("dw/campaign/PromotionMgr");
  var formatMoney = require("dw/util/StringUtils").formatMoney;
  var collections = require("*/cartridge/scripts/util/collections");

  var plan = PromotionMgr.getDiscounts(basket);
  if (!plan) return [];

  /**
   * @param {dw.campaign.DiscountPlan} approaching - one approaching discount
   * @returns {{distance: string, calloutMsg: string}} the pair
   */
  function toPair(approaching) {
    var promotion = approaching.getDiscount().getPromotion();
    var callout = promotion && promotion.getCalloutMsg();

    return {
      distance: formatMoney(approaching.getDistanceFromConditionThreshold()),
      calloutMsg: callout ? String(callout.markup || callout) : "",
    };
  }

  return collections
    .map(plan.getApproachingOrderDiscounts(), toPair)
    .concat(
      collections.map(
        plan.getApproachingShippingDiscounts(basket.defaultShipment),
        toPair
      )
    );
};

module.exports = CartData;
