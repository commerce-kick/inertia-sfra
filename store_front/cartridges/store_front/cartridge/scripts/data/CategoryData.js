"use strict";

var BaseData = require("../BaseData");

/**
 * The category a category-landing PLP is scoped to.
 */
var CategoryData = BaseData.extend({
  schema: {
    /** @type {string} category ID (cgid) */
    id: { type: "string", default: "" },
    /** @type {string} display name */
    name: { type: "string", default: "" },
    /** @type {string} page title override when set in Business Manager */
    pageTitle: { type: "string", default: "" },
    /** @type {string} banner image URL when set in Business Manager */
    bannerImageUrl: {
      transform: function (url) {
        return url ? url.toString() : "";
      },
      default: "",
    },
  },
});

module.exports = CategoryData;
