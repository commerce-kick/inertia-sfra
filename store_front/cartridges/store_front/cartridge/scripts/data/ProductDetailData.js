"use strict";

var BaseData = require("../BaseData");
var PriceData = require("./PriceData");
var productUrls = require("./productUrls");

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
    /** @type {Array<{id: string, calloutMsg: string, name: string, details: string}>} active promotion callouts */
    promotions: {
      transform: function (promotions) {
        if (!promotions) return [];
        return (Array.isArray(promotions) ? promotions : []).map(function (promotion) {
          return {
            id: promotion.id || "",
            calloutMsg: promotion.calloutMsg || "",
            name: promotion.name || "",
            details: promotion.details || "",
          };
        });
      },
      default: function () {
        return [];
      },
    },
    /** @type {Array<{id: string, displayName: string, displayValue: string, swatchable: boolean, resetUrl: string, values: Array<{id: string, displayValue: string, selected: boolean, selectable: boolean, url: string, variationUrl: string, image: {url: string, alt: string}|null}>}>} variation attributes, each value carrying the Product-Show URL that selects it */
    variationAttributes: {
      transform: function (attrs) {
        if (!attrs) return [];
        var items = Array.isArray(attrs) ? attrs : [];
        return items.map(function (attr) {
          return {
            id: attr.attributeId || attr.id || "",
            displayName: attr.displayName || "",
            // The selected value's label, so the UI can say "Color: Black"
            // without hunting through values for selected.
            displayValue: attr.displayValue || "",
            swatchable: Boolean(attr.swatchable),
            // Clears this attribute's selection. Base only emits it for
            // non-swatch attributes; empty means "no reset offered".
            resetUrl: productUrls.normalizeVariationUrl(attr.resetUrl),
            values: (attr.values || []).map(function (value) {
              var swatch =
                value.images && value.images.swatch && value.images.swatch.length
                  ? value.images.swatch[0]
                  : null;
              return {
                id: value.id || "",
                displayValue: value.displayValue || "",
                selected: Boolean(value.selected),
                // False when no orderable variant exists for this combination.
                // Base omits `url` entirely in that case.
                selectable: Boolean(value.selectable),
                url: productUrls.normalizeVariationUrl(value.url),
                // The same selection against the JSON endpoint, for callers
                // that must stay on the current page (quickview).
                variationUrl: value.url ? value.url.toString() : "",
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
    promotions: product.promotions,
    variationAttributes: product.variationAttributes,
  });
};

module.exports = ProductDetailData;
