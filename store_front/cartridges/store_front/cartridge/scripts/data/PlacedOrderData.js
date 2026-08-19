"use strict";

var BaseData = require("../BaseData");

/**
 * What placing an order answers with: the handle to the order that now
 * exists, and where to see it.
 *
 * Base answered `{error: false, orderID, orderToken, continueUrl}` and let
 * its jQuery build a form POST to Order-Confirm out of the three. The token
 * is what lets a guest see their own order without an account, so all three
 * travel; assembling the destination is the confirmation row's job (7.1).
 */
var PlacedOrderData = BaseData.extend({
  schema: {
    /** @type {string} the order number */
    orderId: { type: "string", default: "" },
    /** @type {string} the token that authorizes seeing it without signing in */
    orderToken: { type: "string", default: "" },
    /** @type {string} where the shopper goes to see it — base's Order-Confirm */
    continueUrl: { type: "string", default: "" },
  },
});

module.exports = PlacedOrderData;
