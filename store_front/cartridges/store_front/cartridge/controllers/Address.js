"use strict";

/**
 * @namespace Address
 */

const server = require("server");
server.extend(module.superModule);

// The reset-then-json seam and the failure envelope, shared with Cart.js
// and Account.js.
var answerJson = require("*/cartridge/scripts/helpers/answerJson");
var answer = answerJson.answerJson;
var answerError = answerJson.answerError;

/**
 * Base guards its two AJAX routes with `userLoggedIn.validateLoggedInAjax`,
 * which answers a 500 with `{loggedin: false, redirectUrl}` — a status the
 * browser rejects on before anything reads the body, so the shopper would be
 * told "Request failed with status code 500" rather than sent to sign in
 * again. Normalized to the envelope `app/lib/queries/sfra.ts` already
 * follows.
 *
 * @param {Object} res - the SFRA response
 * @returns {boolean} true when the request was answered because nobody is signed in
 */
function refusedSignedOut(res) {
  var viewData = res.getViewData();
  if (viewData.loggedin !== false) return false;

  answerError(res, "Your session ended. Please sign in again.", viewData.redirectUrl);
  return true;
}

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

/**
 * Address-DeleteAddress: remove an address from the book.
 *
 * Base removes it, and — when the one removed was the default and others
 * remain — promotes the first of those to default in the same transaction.
 * Both stay, as does the account-edited email it sends.
 *
 * Left standing: base reads `addressBook.getAddress(addressId).getUUID()`
 * without checking the address was found, so a hand-made URL naming an
 * address that is not there throws. Repairing it means replacing the route
 * and reimplementing the default-promotion bookkeeping, and no surface in the
 * storefront can produce that ID.
 *
 * @queryParam addressId required string the shopper's label for the address to remove
 * @queryParam isDefault optional boolean whether the address being removed is the default one
 */
server.append("DeleteAddress", function (req, res, next) {
  if (refusedSignedOut(res)) return next();

  this.on("route:BeforeComplete", function (beforeReq, beforeRes) {
    var CustomerMgr = require("dw/customer/CustomerMgr");
    var AddressDeletedData = require("*/cartridge/scripts/data/AddressDeletedData");

    var viewData = beforeRes.getViewData();
    var customer = CustomerMgr.getCustomerByCustomerNumber(
      beforeReq.currentCustomer.profile.customerNo
    );

    answer(
      beforeRes,
      AddressDeletedData.from({
        uuid: viewData.UUID,
        remaining: customer.getProfile().getAddressBook().getAddresses().length,
      })
    );
  });

  return next();
});

module.exports = server.exports();
