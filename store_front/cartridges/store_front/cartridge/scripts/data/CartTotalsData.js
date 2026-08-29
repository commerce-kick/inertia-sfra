"use strict";

var BaseData = require("../BaseData");
var CartDiscountData = require("./CartDiscountData");

/**
 * The money column of the basket: every figure the totals rail prints.
 *
 * Base's totals model formats each amount on the server and answers "-" for
 * anything the platform could not compute yet (no shipping method, no tax
 * jurisdiction), so the strings arrive ready to print and the two discount
 * lines carry a numeric `value` purely so the template can hide a zero. That
 * contract is kept verbatim — the rail hides on `value === 0` exactly as base
 * did — with `discountsHtml` dropped: it was a server-rendered copy of the
 * same discount array, for jQuery to swap into the coupon panel.
 */

/**
 * @param {Object} amount - a totals-model {value, formatted} pair, or "-"
 * @returns {{value: number, formatted: string}}
 */
function toAmount(amount) {
  if (!amount || typeof amount !== "object") return { value: 0, formatted: "" };
  return {
    value: typeof amount.value === "number" ? amount.value : 0,
    formatted: amount.formatted || "",
  };
}

var CartTotalsData = BaseData.extend({
  schema: {
    /** @type {string} merchandise total after order-level discounts */
    subTotal: { type: "string", default: "-" },
    /** @type {string} estimated order total, "-" until shipping resolves */
    grandTotal: { type: "string", default: "-" },
    /** @type {string} estimated tax, "-" until shipping resolves */
    totalTax: { type: "string", default: "-" },
    /** @type {string} shipping cost before shipping discounts */
    totalShippingCost: { type: "string", default: "-" },
    /** @type {{value: number, formatted: string}} order-level discount; hidden when value is 0 */
    orderDiscount: { transform: toAmount, default: function () {
      return { value: 0, formatted: "" };
    } },
    /** @type {{value: number, formatted: string}} shipping discount; hidden when value is 0 */
    shippingDiscount: { transform: toAmount, default: function () {
      return { value: 0, formatted: "" };
    } },
    /** @type {ICartDiscountData[]} coupons entered and promotions applied */
    discounts: {
      of: CartDiscountData,
      transform: function (discounts) {
        return (discounts || []).map(CartDiscountData.fromDiscount);
      },
      default: function () {
        return [];
      },
    },
  },
});

/**
 * Map a totals model to a plain CartTotalsData object.
 * @param {Object} totals - SFRA totals model (cartModel.totals)
 * @returns {Object} plain CartTotalsData object
 */
CartTotalsData.fromModel = function (totals) {
  if (!totals) return CartTotalsData.from({});

  return CartTotalsData.from({
    subTotal: totals.subTotal,
    grandTotal: totals.grandTotal,
    totalTax: totals.totalTax,
    totalShippingCost: totals.totalShippingCost,
    orderDiscount: totals.orderLevelDiscountTotal,
    shippingDiscount: totals.shippingLevelDiscountTotal,
    discounts: totals.discounts,
  });
};

module.exports = CartTotalsData;
