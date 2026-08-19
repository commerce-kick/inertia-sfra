"use strict";

/**
 * @namespace Address
 */

const server = require("server");
server.extend(module.superModule);

var initInertia = require("*/cartridge/scripts/middleware/initInertia");
var shareData = require("*/cartridge/scripts/middleware/shareData");

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

/**
 * Address-List: the address book.
 *
 * Base builds the list already — it re-reads the customer so the UUIDs are
 * the stored ones — and this appends the typed slice of it. Base decided
 * which entry was the default *positionally*, by comparing every row against
 * `addressBook[0]`; the platform does return the preferred address first, so
 * the answer was right, but the fact is named here instead of inferred: each
 * address carries `isDefault`, compared against the book's actual preferred
 * address.
 *
 * Dropped: the `actionUrls` bag (generated route helpers) and the breadcrumb
 * trail, whose two links — Home and Account — the header wordmark and the
 * page's own "Back to account" already are.
 */
server.append("List", initInertia.init, shareData, function (req, res, next) {
  var CustomerMgr = require("dw/customer/CustomerMgr");
  var AddressData = require("*/cartridge/scripts/data/AddressData");

  var viewData = res.getViewData();
  var customer = CustomerMgr.getCustomerByCustomerNumber(req.currentCustomer.profile.customerNo);
  var preferred = customer.getProfile().getAddressBook().getPreferredAddress();
  var preferredId = preferred ? preferred.getID() : null;

  res.inertia.render("Address/List", {
    addresses: (viewData.addressBook || []).map(function (model) {
      return AddressData.fromModel(model, Boolean(preferredId) && model.address.ID === preferredId);
    }),
  });

  return next();
});

/**
 * Address-AddAddress: the empty address form.
 *
 * Base clears the `address` form and renders the same template
 * Address-EditAddress renders; the port keeps that — one page, `Address/Edit`,
 * told apart by whether an `addressId` came with it.
 */
server.append("AddAddress", initInertia.init, shareData, function (req, res, next) {
  var AddressFormData = require("*/cartridge/scripts/data/AddressFormData");

  res.inertia.render("Address/Edit", {
    form: AddressFormData.fromForm(res.getViewData().addressForm),
    addressId: "",
  });

  return next();
});

/**
 * Address-EditAddress: the same form, filled from a stored address.
 *
 * Base clears the form and then `copyFrom`s the address model, which is what
 * puts the stored values on the fields — so the prefill rides on the fields
 * themselves and nothing has to be copied across again here.
 *
 * The `addressId` travels as its own prop as well as being a field: the field
 * is what the shopper may rename the address to, the prop is which address is
 * being edited, and Address-SaveAddress genuinely needs both to tell a rename
 * from a collision.
 *
 * @queryParam addressId required string the address being edited
 */
server.append("EditAddress", initInertia.init, shareData, function (req, res, next) {
  var AddressFormData = require("*/cartridge/scripts/data/AddressFormData");

  var viewData = res.getViewData();

  res.inertia.render("Address/Edit", {
    form: AddressFormData.fromForm(viewData.addressForm),
    addressId: viewData.addressId || "",
  });

  return next();
});

module.exports = server.exports();
