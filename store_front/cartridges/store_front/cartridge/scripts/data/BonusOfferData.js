"use strict";

var BaseData = require("../BaseData");

/**
 * A choice-of-bonus promotion the shopper has just earned: the discount they
 * may pick against, and the finished URL that lists what they may pick.
 *
 * Base answered a much wider object — two candidate chooser URLs, an
 * add-to-cart URL, a page size, a label bag, a `selectprods: []` that was
 * always empty, and the raw discount line item — and left the client to
 * choose between the URLs on `bonusChoiceRuleBased`. That choice is the
 * server's to make, so one `chooserUrl` arrives already resolved; the
 * add-to-cart URL comes from the generated route helper.
 */
var BonusOfferData = BaseData.extend({
  schema: {
    /** @type {string} UUID of the bonus discount line item, the handle Cart-AddBonusProducts takes */
    uuid: { type: "string", default: "" },
    /** @type {string} UUID of the product line item that earned the offer */
    pliUuid: { type: "string", default: "" },
    /** @type {number} how many bonus products the promotion allows */
    maxPids: { type: "number", default: 0 },
    /** @type {string} finished Product-ShowBonusProducts URL — rule-based with paging, or list-based with named pids */
    chooserUrl: { type: "string", default: "" },
  },
});

/**
 * Map base's newBonusDiscountLineItem bag to a plain BonusOfferData object.
 * @param {Object} offer - base's bonus discount line item result
 * @returns {Object|null} plain BonusOfferData object, or null when there is no offer
 */
BonusOfferData.fromResult = function (offer) {
  if (!offer || !offer.uuid) return null;

  return BonusOfferData.from({
    uuid: offer.uuid,
    pliUuid: offer.pliUUID,
    maxPids: offer.maxBonusItems,
    chooserUrl: offer.bonusChoiceRuleBased
      ? offer.showProductsUrlRuleBased
      : offer.showProductsUrlListBased,
  });
};

module.exports = BonusOfferData;
