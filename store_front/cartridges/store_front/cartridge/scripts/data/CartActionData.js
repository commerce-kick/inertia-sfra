"use strict";

var BaseData = require("../BaseData");
var BonusOfferData = require("./BonusOfferData");

/**
 * What a cart route answers when it changed the basket without needing to
 * hand the whole basket back: whether it worked, what to say about it, the
 * new bag count, and any choice-of-bonus promotion the change just earned.
 *
 * Base returned the entire cart model alongside all of that, plus a
 * pre-pluralized minicart string and a reporting URL. The cart page refreshes
 * itself with a partial reload and the header count comes from Cart-MiniCart,
 * so the basket does not need to ride on a mutation's answer.
 *
 * Base also put failure text in `message` while setting `error: true`, which
 * the client's error envelope does not read. The two are separated here so a
 * failure arrives as `errorMessage` and rejects with something worth showing.
 */
var CartActionData = BaseData.extend({
  schema: {
    /** @type {boolean} true when the basket was not changed */
    error: { type: "boolean", default: false },
    /** @type {string} why it failed, empty on success */
    errorMessage: { type: "string", default: "" },
    /** @type {string} what to say about the success, empty on failure */
    message: { type: "string", default: "" },
    /** @type {number} total product quantity in the basket after the change */
    quantityTotal: { type: "number", default: 0 },
    /** @type {string} UUID of the line item the change created or touched */
    pliUuid: { type: "string", default: "" },
    /** @type {IBonusOfferData | null} a choice-of-bonus promotion this change earned */
    bonusOffer: {
      of: BonusOfferData,
      transform: function (offer) {
        return BonusOfferData.fromResult(offer);
      },
      default: null,
    },
  },
});

/**
 * Map base's add-to-cart answer to a plain CartActionData object.
 * @param {Object} result - the view data base's route answered with
 * @returns {Object} plain CartActionData object
 */
CartActionData.fromResult = function (result) {
  var failed = Boolean(result.error);

  return CartActionData.from({
    error: failed,
    errorMessage: failed ? result.errorMessage || result.message : "",
    message: failed ? "" : result.message || result.msg,
    quantityTotal: result.quantityTotal,
    pliUuid: result.pliUUID,
    bonusOffer: result.newBonusDiscountLineItem,
  });
};

module.exports = CartActionData;
