"use strict";

var BaseData = require("../BaseData");

/**
 * One bonus product already chosen against a bonus discount line item — what
 * the chooser lists back to the shopper, and what Cart-AddBonusProducts
 * submits.
 *
 * Base built this shape inline in Product-ShowBonusProducts and wrote the
 * option value over the option ID (`option.optionid` assigned twice), so the
 * chosen option never reached its template. The two are separate fields here.
 */
var BonusProductLineItemData = BaseData.extend({
  schema: {
    /** @type {string} product ID of the chosen bonus product */
    pid: { type: "string", default: "" },
    /** @type {string} display name */
    name: { type: "string", default: "" },
    /** @type {number} quantity already submitted for this bonus product */
    quantity: { type: "number", default: 1 },
    /** @type {string} product-option ID, empty when the product has no options */
    optionId: { type: "string", default: "" },
    /** @type {string} chosen option value ID, empty when the product has no options */
    optionValue: { type: "string", default: "" },
  },
});

/**
 * Map a bonus product line item to a plain BonusProductLineItemData object.
 * @param {dw.order.ProductLineItem} lineItem - a bonus product line item
 * @returns {Object} plain BonusProductLineItemData object
 */
BonusProductLineItemData.fromLineItem = function (lineItem) {
  var optionItems = lineItem.optionProductLineItems;
  var option = optionItems && !optionItems.empty ? optionItems[0] : null;

  return BonusProductLineItemData.from({
    pid: lineItem.productID,
    name: lineItem.productName,
    quantity: lineItem.quantityValue,
    optionId: option ? option.optionID : "",
    optionValue: option ? option.optionValueID : "",
  });
};

module.exports = BonusProductLineItemData;
