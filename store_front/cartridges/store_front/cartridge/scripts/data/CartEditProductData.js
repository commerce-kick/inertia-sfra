"use strict";

var BaseData = require("../BaseData");
var ProductDetailData = require("./ProductDetailData");

/**
 * The product behind a cart line, as the edit dialog needs it: the product
 * itself, plus the three handles Cart-EditProductLineItem takes back.
 *
 * Base answered `{ renderedTemplate }` — product/quickView.isml rendered to a
 * string for a jQuery modal — alongside a close-button label and a screen
 * reader announcement. The product is typed here instead, so the dialog is
 * the same components the PDP and quickview are built from.
 */
var CartEditProductData = BaseData.extend({
  schema: {
    /** @type {boolean} true when the line is no longer in the basket */
    error: { type: "boolean", default: false },
    /** @type {string} why the line could not be read, empty on success */
    errorMessage: { type: "string", default: "" },
    /** @type {string} UUID of the line being edited */
    uuid: { type: "string", default: "" },
    /** @type {IProductDetailData | null} the product, as the PDP types it */
    product: {
      of: ProductDetailData,
      transform: function (model) {
        return ProductDetailData.fromModel(model);
      },
      default: null,
    },
    /** @type {number} the quantity the line currently carries */
    selectedQuantity: { type: "number", default: 1 },
    /** @type {string} the product-option value the line currently carries, empty when it has no options */
    selectedOptionValueId: { type: "string", default: "" },
  },
});

module.exports = CartEditProductData;
