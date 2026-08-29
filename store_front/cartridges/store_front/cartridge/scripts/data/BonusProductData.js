"use strict";

var BaseData = require("../BaseData");
var ProductDetailData = require("./ProductDetailData");

/**
 * One product a shopper may choose against a choice-of-bonus promotion.
 *
 * The bonus product model (models/product/bonusProduct.js) is a thinner
 * decoration than the PDP's: images, variation attributes, availability,
 * quantities, readyToOrder and a bonus unit price — no list price, no
 * promotions, no description. It is still a product, so the product itself
 * rides as ProductDetailData and the chooser reuses the PDP's components;
 * the fields the PDP model never carries simply arrive at their defaults.
 */
var BonusProductData = BaseData.extend({
  schema: {
    /** @type {IProductDetailData} the product, as the PDP types it */
    product: {
      of: ProductDetailData,
      transform: function (model) {
        return ProductDetailData.fromModel(model);
      },
      default: null,
    },
    /** @type {string} formatted price this product is offered at under the promotion, empty when it cannot be priced */
    bonusUnitPrice: {
      transform: function (price) {
        return price ? String(price) : "";
      },
      default: "",
    },
    /** @type {Array<{value: number, selected: boolean, url: string}>} orderable quantities; `url` re-resolves the product at that quantity */
    quantities: {
      transform: function (quantities) {
        return (quantities || []).map(function (quantity) {
          return {
            value: parseInt(quantity.value, 10) || 0,
            selected: Boolean(quantity.selected),
            url: quantity.url ? quantity.url.toString() : "",
          };
        });
      },
      default: function () {
        return [];
      },
    },
    /** @type {boolean} every variation attribute is chosen, so this product can be added */
    readyToOrder: { type: "boolean", default: false },
    /** @type {string} "product", "variant", "master", "bundle" or "set" — a master must be resolved to a variant before it can be chosen */
    productType: { type: "string", default: "" },
  },
});

/**
 * Map a bonus product model to a plain BonusProductData object.
 * @param {Object} product - SFRA bonus product model (ProductFactory pview "bonus")
 * @returns {Object} plain BonusProductData object
 */
BonusProductData.fromModel = function (product) {
  return BonusProductData.from({
    product: product,
    bonusUnitPrice: product.bonusUnitPrice,
    quantities: product.quantities,
    readyToOrder: product.readyToOrder,
    productType: product.productType,
  });
};

module.exports = BonusProductData;
