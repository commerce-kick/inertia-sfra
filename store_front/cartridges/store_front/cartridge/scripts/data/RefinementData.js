"use strict";

var BaseData = require("../BaseData");
var RefinementValueData = require("./RefinementValueData");

/**
 * One refinement group from productSearch.refinements (category, attribute,
 * price, or promotion refinement) with its selectable values.
 */
var RefinementData = BaseData.extend({
  schema: {
    /** @type {string} group heading (e.g. "Color", "Size", "Category") */
    displayName: { type: "string", default: "" },
    /** @type {boolean} group refines by category */
    isCategoryRefinement: {
      transform: function (v) {
        return Boolean(v);
      },
      default: false,
    },
    /** @type {boolean} group refines by product attribute */
    isAttributeRefinement: {
      transform: function (v) {
        return Boolean(v);
      },
      default: false,
    },
    /** @type {boolean} group refines by price bucket */
    isPriceRefinement: {
      transform: function (v) {
        return Boolean(v);
      },
      default: false,
    },
    /** @type {boolean} group refines by promotion */
    isPromotionRefinement: {
      transform: function (v) {
        return Boolean(v);
      },
      default: false,
    },
    values: { type: "collection", of: RefinementValueData },
  },
});

module.exports = RefinementData;
