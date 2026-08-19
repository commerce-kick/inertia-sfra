"use strict";

/**
 * @namespace Address
 */

const server = require("server");
server.extend(module.superModule);

// The reset-then-json seam, shared with Cart.js and Account.js.
var answer = require("*/cartridge/scripts/helpers/answerJson").answerJson;

/**
 * Address-SaveAddress: create or rename an address in the book.
 *
 * Base does both jobs through one route, told apart by whether the URL names
 * an existing `addressId`: with one it fetches that address and lets the form
 * rename it, without one it creates the address under the ID the form gives.
 * Either way the ID is the shopper's own label ("Home"), it must be unique in
 * the book, and base answers "that ID already exists" on the field itself.
 * All of that is base's and stays.
 *
 * The work happens in base's `route:BeforeComplete`, so this registers one
 * after it — the pattern rows 3.4, 4.3 and 4.5 established — and retypes the
 * answer as `FormResultData`.
 *
 * @queryParam addressId optional string the address being edited; absent when creating one
 * @formParam dwfrm_address_addressId required string the shopper's label for this address
 * @formParam dwfrm_address_firstName required string given name
 * @formParam dwfrm_address_lastName required string family name
 * @formParam dwfrm_address_address1 required string street line
 * @formParam dwfrm_address_address2 optional string second street line
 * @formParam dwfrm_address_city required string city
 * @formParam dwfrm_address_states_stateCode required string state or province code
 * @formParam dwfrm_address_postalCode required string postal code
 * @formParam dwfrm_address_country required string ISO country code
 * @formParam dwfrm_address_phone required string phone number
 */
server.append("SaveAddress", function (req, res, next) {
  this.on("route:BeforeComplete", function (beforeReq, beforeRes) {
    var FormResultData = require("*/cartridge/scripts/data/FormResultData");

    answer(beforeRes, FormResultData.fromViewData(beforeRes.getViewData()));
  });

  return next();
});

module.exports = server.exports();
