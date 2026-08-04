"use strict";

var BaseData = require("../BaseData");
var searchUrls = require("./searchUrls");

/**
 * One selectable value inside a refinement group (a color, a size, a
 * category, a price bucket). URLs are normalized to Search-Show.
 */
var RefinementValueData = BaseData.extend({
  schema: {
    /** @type {string} refinement value ID */
    id: { type: "string", default: "" },
    /** @type {string} label shown to the shopper */
    displayValue: { type: "string", default: "" },
    /** @type {number} matching product count */
    hitCount: {
      transform: function (n) {
        return typeof n === "number" ? n : 0;
      },
      default: 0,
    },
    /** @type {boolean} currently applied */
    selected: {
      transform: function (v) {
        return Boolean(v);
      },
      default: false,
    },
    /** @type {boolean} can be applied from the current result set */
    selectable: {
      transform: function (v) {
        return Boolean(v);
      },
      default: true,
    },
    /** @type {string} Search-Show URL that toggles this value */
    url: {
      transform: searchUrls.normalizeSearchUrl,
      default: "",
    },
  },
});

module.exports = RefinementValueData;
