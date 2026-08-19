"use strict";

var BaseData = require("../BaseData");

/**
 * What removing an address answers with.
 *
 * Base answered `{UUID, defaultMsg, message}`: the UUID so its jQuery could
 * find the row to delete from the DOM, and two resource strings — the word
 * "Default" to re-label whichever address inherited that status, and an
 * "you have no saved addresses" line for an emptied book. None of the three
 * survives a re-render: the page reloads its own `addresses` prop and every
 * one of those facts is in it.
 *
 * What is worth answering is the count base computed and threw away — it
 * checked `length === 0` to choose between its two messages — so the caller
 * can tell an emptied book from a shortened one without waiting for the
 * reload.
 */
var AddressDeletedData = BaseData.extend({
  schema: {
    /** @type {string} UUID of the address that was removed */
    uuid: { type: "string", default: "" },
    /** @type {number} how many addresses the book still holds */
    remaining: { type: "number", default: 0 },
  },
});

module.exports = AddressDeletedData;
