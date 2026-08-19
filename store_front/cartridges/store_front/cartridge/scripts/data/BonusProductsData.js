"use strict";

var BaseData = require("../BaseData");
var BonusProductData = require("./BonusProductData");
var BonusProductLineItemData = require("./BonusProductLineItemData");

/**
 * The choice-of-bonus payload: one page of the products a shopper may pick
 * from, plus what they have already picked.
 *
 * Base rendered product/components/choiceOfBonusProducts/bonusProducts.isml
 * to an HTML string for a jQuery modal to inject; the same information is
 * typed here, so the chooser can be built from the PDP's own components.
 *
 * Built via BonusProductsData.fromSelection — see the controller.
 */
var BonusProductsData = BaseData.extend({
  schema: {
    /** @type {string} UUID of the bonus discount line item being chosen against */
    duuid: { type: "string", default: "" },
    /** @type {IBonusProductData[]} this page of eligible bonus products */
    products: {
      of: BonusProductData,
      // A transform, not `type: "collection"`: a collection re-runs the child
      // schema over whatever it is handed, so mapping the models to plain
      // objects first and *then* declaring a collection ran every transform
      // twice. The second pass sees an already-normalized image bag and an
      // already-normalized swatch, finds neither, and drops both — which is
      // what this field did until row 2.11 built the chooser that shows them.
      transform: function (models) {
        return (models || []).map(BonusProductData.fromModel);
      },
      default: function () {
        return [];
      },
    },
    /** @type {IBonusProductLineItemData[]} bonus products already chosen against this discount */
    selected: {
      type: "collection",
      of: BonusProductLineItemData,
      default: function () {
        return [];
      },
    },
    /** @type {number} how many bonus products this promotion allows */
    maxPids: { type: "number", default: 0 },
    /** @type {string} Product-ShowBonusProducts URL for the next page, empty when the caller asked for named pids */
    moreUrl: { type: "string", default: "" },
    /** @type {boolean} whether a further page exists behind moreUrl */
    showMore: { type: "boolean", default: false },
  },
});

module.exports = BonusProductsData;
