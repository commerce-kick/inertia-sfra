"use strict";

var BaseData = require("../BaseData");
var PriceData = require("./PriceData");

/**
 * The PDP product: a trimmed, typed slice of the SFRA full product model.
 * Built via ProductDetailData.fromModel (controller reshapes the model's
 * description/images before schema mapping).
 */
var ProductDetailData = BaseData.extend({
  schema: {
    /** @type {string} product ID */
    id: { type: "string", default: "" },
    /** @type {string} display name */
    productName: { type: "string", default: "" },
    /** @type {{sales: {value: number, formatted: string}|null, list: {value: number, formatted: string}|null, min: {value: number, formatted: string}|null, max: {value: number, formatted: string}|null, isRange: boolean} | null} normalized price */
    price: {
      transform: function (price) {
        return PriceData.fromModel(price);
      },
      default: null,
    },
    /** @type {Array<{url: string, alt: string}>} gallery images, largest available view type */
    images: {
      transform: function (groups) {
        var list = [];
        ["large", "medium", "small"].some(function (type) {
          var group = groups && groups[type];
          if (group && group.length) {
            group.forEach(function (img) {
              list.push({ url: img.url.toString(), alt: img.alt || "" });
            });
            return true;
          }
          return false;
        });
        return list;
      },
      default: function () {
        return [];
      },
    },
    /** @type {string} description markup (long, falling back to short) */
    description: { type: "string", default: "" },
    /** @type {{available: boolean, messages: string[]}} availability summary */
    availability: {
      transform: function (availability) {
        return {
          available: Boolean(availability && availability.available),
          messages:
            (availability &&
              availability.messages &&
              availability.messages.map(String)) ||
            [],
        };
      },
      default: function () {
        return { available: false, messages: [] };
      },
    },
    /** @type {number} average rating, 0 when unrated */
    rating: {
      transform: function (r) {
        return typeof r === "number" ? r : 0;
      },
      default: 0,
    },
    /** @type {Array<{id: string, displayName: string, swatchable: boolean, values: Array<{id: string, displayValue: string, selected: boolean, image: {url: string, alt: string}|null}>}>} variation attributes for display */
    variationAttributes: {
      transform: function (attrs) {
        if (!attrs) return [];
        var items = Array.isArray(attrs) ? attrs : [];
        return items.map(function (attr) {
          return {
            id: attr.attributeId || attr.id || "",
            displayName: attr.displayName || "",
            swatchable: Boolean(attr.swatchable),
            values: (attr.values || []).map(function (value) {
              var swatch =
                value.images && value.images.swatch && value.images.swatch.length
                  ? value.images.swatch[0]
                  : null;
              return {
                id: value.id || "",
                displayValue: value.displayValue || "",
                selected: Boolean(value.selected),
                image: swatch
                  ? { url: swatch.url.toString(), alt: swatch.alt || "" }
                  : null,
              };
            }),
          };
        });
      },
      default: function () {
        return [];
      },
    },
  },
});

/**
 * Map a full product model to a plain ProductDetailData object.
 * @param {Object} product - SFRA full product model (viewData.product)
 * @returns {Object} plain ProductDetailData object
 */
ProductDetailData.fromModel = function (product) {
  return ProductDetailData.from({
    id: product.id,
    productName: product.productName,
    price: product.price,
    images: product.images,
    description: product.longDescription || product.shortDescription || "",
    availability: {
      available: Boolean(product.available),
      messages:
        (product.availability && product.availability.messages) || [],
    },
    rating: product.rating,
    variationAttributes: product.variationAttributes,
  });
};

module.exports = ProductDetailData;
