"use strict";

var BaseData = require("../BaseData");

/**
 * One linked suggestion — a product, a category or a content page. `detail`
 * carries the secondary line the base template showed for categories (the
 * parent category name); it is empty for the other kinds.
 */
var SuggestionLinkData = BaseData.extend({
  schema: {
    /** @type {string} display name */
    name: { type: "string", default: "" },
    /** @type {string} destination URL, authored by the base suggestion model */
    url: {
      transform: function (url) {
        return url ? url.toString() : "";
      },
      default: "",
    },
    /** @type {string} thumbnail URL, empty when the record has no image */
    imageUrl: {
      transform: function (url) {
        return url ? url.toString() : "";
      },
      default: "",
    },
    /** @type {string} secondary line — the parent category name, else empty */
    detail: { type: "string", default: "" },
  },
});

module.exports = SuggestionLinkData;
