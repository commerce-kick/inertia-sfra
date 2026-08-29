"use strict";

var BaseData = require("../BaseData");

/**
 * The bag count in the header — the whole payload of Cart-MiniCart.
 *
 * Base answered this route with a rendered ISML fragment (the bag glyph, the
 * count, and an empty popover div) that the page header pulled in as a
 * remote include. There is no markup to deliver to a typed client, so the
 * route answers the one number the fragment existed to print.
 */
var MiniCartData = BaseData.extend({
  schema: {
    /** @type {number} total product quantity in the basket, 0 when there is no basket */
    quantity: { type: "number", default: 0 },
  },
});

module.exports = MiniCartData;
