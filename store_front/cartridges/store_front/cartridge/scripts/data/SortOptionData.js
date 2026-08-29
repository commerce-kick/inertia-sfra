"use strict";

var BaseData = require("../BaseData");
var searchUrls = require("./searchUrls");

/**
 * One sorting rule option from productSearch.productSort, URL normalized
 * to Search-Show.
 */
var SortOptionData = BaseData.extend({
  schema: {
    /** @type {string} sorting rule ID (srule) */
    id: { type: "string", default: "" },
    /** @type {string} label shown in the sort control */
    displayName: { type: "string", default: "" },
    /** @type {string} Search-Show URL applying this sort */
    url: {
      transform: searchUrls.normalizeSearchUrl,
      default: "",
    },
  },
});

module.exports = SortOptionData;
