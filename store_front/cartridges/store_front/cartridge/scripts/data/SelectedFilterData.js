"use strict";

var BaseData = require("../BaseData");
var searchUrls = require("./searchUrls");

/**
 * One applied filter chip: a selected refinement value with the URL that
 * removes it (normalized to Search-Show).
 */
var SelectedFilterData = BaseData.extend({
  schema: {
    /** @type {string} refinement value ID */
    id: { type: "string", default: "" },
    /** @type {string} label shown on the applied-filter chip */
    displayValue: { type: "string", default: "" },
    /** @type {string} Search-Show URL that removes this filter */
    url: {
      transform: searchUrls.normalizeSearchUrl,
      default: "",
    },
  },
});

module.exports = SelectedFilterData;
