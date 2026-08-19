"use strict";

var BaseData = require("../BaseData");

/**
 * One entry of the basket's discount list: either a coupon the shopper
 * entered, or a promotion the campaign engine applied on its own.
 *
 * Base's totals model keyed both shapes into the same array and then
 * rendered them through cart/cartCouponDisplay.isml, branching on `type`.
 * The branch survives; the two shapes are one schema so the wire stays flat,
 * and the coupon's price-adjustment relationship — base kept it as objects
 * only to read `callOutMsg` off each — flattens to the callouts themselves.
 */
var CartDiscountData = BaseData.extend({
  schema: {
    /** @type {string} UUID of the coupon or price-adjustment line item */
    uuid: { type: "string", default: "" },
    /** @type {"coupon" | "promotion"} which of the two shapes this entry is */
    type: { type: "string", default: "promotion" },
    /** @type {string} the code the shopper entered, coupons only */
    couponCode: { type: "string", default: "" },
    /** @type {boolean} whether the coupon actually granted a discount */
    applied: { type: "boolean", default: false },
    /** @type {boolean} whether the coupon is still redeemable */
    valid: { type: "boolean", default: false },
    /** @type {string} the promotion's line-item label, promotions only */
    lineItemText: { type: "string", default: "" },
    /** @type {string} formatted discount amount, promotions only */
    price: { type: "string", default: "" },
    /** @type {string[]} promotion callout messages this discount carries */
    callouts: {
      transform: function (list) {
        if (!list) return [];
        return (Array.isArray(list) ? list : []).filter(Boolean).map(String);
      },
      default: function () {
        return [];
      },
    },
  },
});

/**
 * Read a callout message off a promotion, whichever form it arrives in.
 * @param {Object} value - a MarkupText, a string, or nothing
 * @returns {string} the markup, or an empty string
 */
function toCallout(value) {
  if (!value) return "";
  return String(value.markup || value);
}

/**
 * Map one totals-model discount to a plain CartDiscountData object.
 * @param {Object} discount - a coupon or promotion entry of totals.discounts
 * @returns {Object} plain CartDiscountData object
 */
CartDiscountData.fromDiscount = function (discount) {
  if (discount.type === "coupon") {
    return CartDiscountData.from({
      uuid: discount.UUID,
      type: "coupon",
      couponCode: discount.couponCode,
      applied: discount.applied,
      valid: discount.valid,
      callouts: (discount.relationship || []).map(function (related) {
        return toCallout(related.callOutMsg);
      }),
    });
  }

  return CartDiscountData.from({
    uuid: discount.UUID,
    type: "promotion",
    lineItemText: discount.lineItemText,
    price: discount.price,
    callouts: [toCallout(discount.callOutMsg)],
  });
};

module.exports = CartDiscountData;
