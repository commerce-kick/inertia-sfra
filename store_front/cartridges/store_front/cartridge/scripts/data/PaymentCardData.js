"use strict";

var BaseData = require("../BaseData");

/**
 * One saved credit card, as the platform lets a storefront see it: a masked
 * number, a type, and an expiry. Nothing here is enough to charge anything.
 *
 * Base also built a `cardTypeImage` pointing at a bundled brand SVG
 * (`visa-dark.svg`); the card type is a word here instead, since the brand
 * marks are chromatic and this world is not.
 */
var PaymentCardData = BaseData.extend({
  schema: {
    /** @type {string} the wallet entry's UUID, empty on the dashboard's summary */
    uuid: { type: "string", default: "" },
    /** @type {string} the number as the platform masks it */
    maskedNumber: { type: "string", default: "" },
    /** @type {string} card type, e.g. Visa */
    cardType: { type: "string", default: "" },
    /** @type {string} name on the card, empty where base did not carry it */
    holder: { type: "string", default: "" },
    /** @type {number} expiry month, 1-12 */
    expirationMonth: { type: "number", default: 0 },
    /** @type {number} expiry year */
    expirationYear: { type: "number", default: 0 },
  },
});

/**
 * Map a saved payment instrument to a plain PaymentCardData object.
 * @param {Object} instrument - base's payment instrument object, or null
 * @returns {Object|null} plain PaymentCardData object, or null
 */
PaymentCardData.fromInstrument = function (instrument) {
  if (!instrument) return null;

  return PaymentCardData.from({
    uuid: instrument.UUID,
    maskedNumber: instrument.maskedCreditCardNumber,
    cardType: instrument.creditCardType,
    holder: instrument.creditCardHolder,
    expirationMonth: instrument.creditCardExpirationMonth,
    expirationYear: instrument.creditCardExpirationYear,
  });
};

module.exports = PaymentCardData;
