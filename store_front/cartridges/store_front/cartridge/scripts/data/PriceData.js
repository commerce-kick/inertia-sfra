"use strict";

var BaseData = require("../BaseData");

/**
 * Normalized product price for tiles. SFRA's searchPrice decorator emits
 * default, range, and tiered shapes; this flattens all of them to a single
 * sales/list pair plus an optional range.
 */

/**
 * @param {Object} money - SFRA money-ish object ({value, formatted|decimalPrice})
 * @returns {{value: number, formatted: string}|null}
 */
function toMoney(money) {
  if (!money || money.value === null || money.value === undefined) return null;
  return {
    value: money.value,
    formatted: money.formatted || String(money.value),
  };
}

var PriceData = BaseData.extend({
  schema: {
    /** @type {{value: number, formatted: string} | null} current selling price */
    sales: { transform: toMoney, default: null },
    /** @type {{value: number, formatted: string} | null} struck-through list price */
    list: { transform: toMoney, default: null },
    /** @type {{value: number, formatted: string} | null} range lower bound */
    min: {
      transform: function (m) {
        return toMoney(m && m.sales ? m.sales : m);
      },
      default: null,
    },
    /** @type {{value: number, formatted: string} | null} range upper bound */
    max: {
      transform: function (m) {
        return toMoney(m && m.sales ? m.sales : m);
      },
      default: null,
    },
    /** @type {boolean} true when the price is a range (e.g. product sets) */
    isRange: {
      transform: function (v) {
        return Boolean(v);
      },
      default: false,
    },
  },
});

/**
 * Build a PriceData object from any SFRA price model shape.
 * @param {Object} price - tile model price (default/range/tiered)
 * @returns {Object|null} plain PriceData object
 */
PriceData.fromModel = function (price) {
  if (!price) return null;
  if (price.type === "range") {
    return PriceData.from({
      min: price.min,
      max: price.max,
      sales: price.min && price.min.sales,
      list: null,
      isRange: true,
    });
  }
  if (price.type === "tiered") {
    var first =
      price.tiers && price.tiers.length ? price.tiers[0].price : null;
    return PriceData.from({ sales: first, list: null, isRange: false });
  }
  return PriceData.from({
    sales: price.sales,
    list: price.list,
    isRange: false,
  });
};

module.exports = PriceData;
