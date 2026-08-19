"use strict";

var BaseData = require("../BaseData");

/** One content asset matched by a content search — an article in the results. */
var ContentResultData = BaseData.extend({
  schema: {
    /** @type {string} the asset's display name */
    name: { type: "string", default: "" },
    /** @type {string} Page-Show URL for the asset */
    url: {
      transform: function (url) {
        return url ? url.toString() : "";
      },
      default: "",
    },
    /** @type {string} the asset's description, plain text */
    description: { type: "string", default: "" },
  },
});

module.exports = ContentResultData;
