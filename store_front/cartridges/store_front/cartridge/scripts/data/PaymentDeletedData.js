"use strict";

var BaseData = require("../BaseData");

/**
 * What removing a saved card answers with — the wallet's counterpart to
 * `AddressDeletedData`, and for the same reason: base answered `{UUID}` plus,
 * on an emptied wallet, a resource string its jQuery wrote into the page. The
 * page re-renders its own list here, so what is worth carrying back is the
 * count base computed and discarded.
 */
var PaymentDeletedData = BaseData.extend({
  schema: {
    /** @type {string} UUID of the card that was removed */
    uuid: { type: "string", default: "" },
    /** @type {number} how many cards the wallet still holds */
    remaining: { type: "number", default: 0 },
  },
});

module.exports = PaymentDeletedData;
