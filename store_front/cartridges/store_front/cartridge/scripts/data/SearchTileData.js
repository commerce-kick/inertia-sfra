"use strict";

var BaseData = require("../BaseData");
var PriceData = require("./PriceData");

/**
 * One PLP grid row: the tile-shaped product the Search controller sends.
 * Built from ProductFactory.get({pview: 'tile'}) via the controller's
 * light reshaping (image flattened to the first medium image, url injected
 * from URLUtils) — see Search.js.
 */

/**
 * @param {Object} value - swatch value from searchVariationAttributes
 * @returns {{id: string, displayValue: string, image: {url: string, alt: string}|null}}
 */
function toSwatchValue(value) {
  var swatch =
    value.images && value.images.swatch && value.images.swatch.length
      ? value.images.swatch[0]
      : null;
  return {
    id: value.id || "",
    displayValue: value.displayValue || value.description || "",
    image: swatch ? { url: swatch.url, alt: swatch.alt || "" } : null,
  };
}

var SearchTileData = BaseData.extend({
  schema: {
    /** @type {string} product ID */
    id: { type: "string" },
    /** @type {string} display name */
    productName: { type: "string" },
    /** @type {string} Product-Show URL for this tile */
    url: { type: "string", default: "" },
    /** @type {{sales: {value: number, formatted: string}|null, list: {value: number, formatted: string}|null, min: {value: number, formatted: string}|null, max: {value: number, formatted: string}|null, isRange: boolean} | null} normalized price */
    price: {
      transform: function (price) {
        return PriceData.fromModel(price);
      },
      default: null,
    },
    /** @type {{url: string, alt: string} | null} primary tile image */
    image: {
      transform: function (img) {
        if (!img || !img.url) return null;
        return { url: img.url.toString(), alt: img.alt || "" };
      },
      default: null,
    },
    /** @type {number} average rating, 0 when unrated */
    rating: {
      transform: function (r) {
        return typeof r === "number" ? r : 0;
      },
      default: 0,
    },
    /** @type {Array<{id: string, swatchable: boolean, values: Array<{id: string, displayValue: string, image: {url: string, alt: string}|null}>}>} swatchable variation attributes */
    variationAttributes: {
      transform: function (attrs) {
        if (!attrs) return [];
        var list = [];
        var items = Array.isArray(attrs) ? attrs : [];
        items.forEach(function (attr) {
          if (!attr) return;
          list.push({
            id: attr.attributeId || attr.id || "",
            swatchable: Boolean(attr.swatchable),
            values: (attr.values || []).map(toSwatchValue),
          });
        });
        return list;
      },
      default: function () {
        return [];
      },
    },
  },
});

module.exports = SearchTileData;
