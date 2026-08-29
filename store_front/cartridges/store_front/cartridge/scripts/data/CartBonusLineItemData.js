"use strict";

var BaseData = require("../BaseData");
var lineItemFields = require("./lineItemFields");

/**
 * A bonus product already in the basket, nested under the line item that
 * earned it — base's cart/productCard/cartNestedBonusProductCard.isml.
 *
 * It is a reduced line item on purpose: a bonus product cannot be removed,
 * re-quantified or edited on its own, so it carries no controls, and its
 * unit price comes from the bonus discount rather than the catalog
 * (`bonusUnitPrice`, which base renders as an already-formatted string).
 */
var CartBonusLineItemData = BaseData.extend({
  schema: {
    /** @type {string} UUID of the bonus product line item */
    uuid: { type: "string", default: "" },
    /** @type {string} product ID */
    id: { type: "string", default: "" },
    /** @type {string} display name */
    productName: { type: "string", default: "" },
    /** @type {{url: string, alt: string} | null} the line item's image */
    image: { transform: lineItemFields.toImage, default: null },
    /** @type {number} quantity granted */
    quantity: { type: "number", default: 1 },
    /** @type {string} formatted per-unit bonus price, empty when the discount no longer resolves */
    unitPrice: { type: "string", default: "" },
    /** @type {string} formatted line total */
    totalPrice: { type: "string", default: "" },
    /** @type {Array<{displayName: string, displayValue: string}>} variation values ordered */
    variationAttributes: {
      transform: lineItemFields.toVariationAttributes,
      default: function () {
        return [];
      },
    },
    /** @type {Array<{optionId: string, selectedValueId: string, displayName: string}>} chosen product options */
    options: {
      transform: lineItemFields.toOptions,
      default: function () {
        return [];
      },
    },
  },
});

/**
 * Map a bonus product line item model to a plain CartBonusLineItemData object.
 * @param {Object} item - line item model (ProductFactory pview 'bonusProductLineItem')
 * @returns {Object} plain CartBonusLineItemData object
 */
CartBonusLineItemData.fromModel = function (item) {
  return CartBonusLineItemData.from({
    uuid: item.UUID,
    id: item.id,
    productName: item.productName,
    image: item.images,
    quantity: item.quantity,
    unitPrice: item.bonusUnitPrice,
    totalPrice: item.priceTotal && item.priceTotal.price,
    variationAttributes: item.variationAttributes,
    options: item.options,
  });
};

module.exports = CartBonusLineItemData;
