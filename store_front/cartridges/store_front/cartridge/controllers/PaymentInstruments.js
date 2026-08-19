"use strict";

/**
 * @namespace PaymentInstruments
 */

const server = require("server");
server.extend(module.superModule);

// The reset-then-json seam and the failure envelope, shared with Cart.js,
// Account.js and Address.js.
var answerJson = require("*/cartridge/scripts/helpers/answerJson");
var answer = answerJson.answerJson;
var answerError = answerJson.answerError;

/**
 * Base guards this route with `userLoggedIn.validateLoggedInAjax`, which
 * answers a 500 with `{loggedin: false, redirectUrl}` — a status the browser
 * rejects on before anything reads the body, so a shopper whose session ended
 * would be told the request failed rather than sent to sign in. Normalized to
 * the envelope, the same way Address.js does.
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
 * PaymentInstruments-SavePayment: save a card to the wallet.
 *
 * Base does the whole job and none of it is worth reimplementing: it verifies
 * the card against the payment methods the site actually accepts for this
 * customer and country (`getApplicablePaymentCards`), asks the platform to
 * validate the number and expiry, creates the wallet entry, and calls the
 * processor's `createToken` hook so the raw number is replaced by a token.
 * The refusals it produces are already per field — an unusable card type on
 * the number, an expired date on the month — which is where they belong.
 *
 * The work is in base's `route:BeforeComplete`, so this registers one after
 * it and retypes the answer as `FormResultData`.
 *
 * `cardType` is a form field base filled in with client-side script (cleave.js
 * watching the number); the port derives it the same way, from the number's
 * prefix, and posts the same four names base's mapping produced.
 *
 * @formParam dwfrm_creditCard_cardOwner required string the name on the card
 * @formParam dwfrm_creditCard_cardNumber required string the card number
 * @formParam dwfrm_creditCard_cardType required string card type, derived from the number
 * @formParam dwfrm_creditCard_expirationMonth required number expiry month, 1-12
 * @formParam dwfrm_creditCard_expirationYear required number expiry year
 */
server.append("SavePayment", function (req, res, next) {
  this.on("route:BeforeComplete", function (beforeReq, beforeRes) {
    var FormResultData = require("*/cartridge/scripts/data/FormResultData");

    answer(beforeRes, FormResultData.fromViewData(beforeRes.getViewData()));
  });

  return next();
});

/**
 * PaymentInstruments-DeletePayment: remove a card from the wallet.
 *
 * Base finds the instrument by UUID, removes it in a transaction and emails
 * the account-edited notice; all of that stays. Its answer was DOM
 * bookkeeping — the UUID of the row to delete, plus a "no saved payments"
 * line for an emptied wallet — so it becomes `PaymentDeletedData`, carrying
 * the same emptiness as the count base computed to choose that message.
 *
 * Left standing: base reads `paymentToDelete.raw` without checking the UUID
 * matched anything, so a hand-made URL naming a card that is not in the
 * wallet throws. No surface in the storefront can produce that UUID.
 *
 * @queryParam UUID required string the wallet entry to remove
 */
server.append("DeletePayment", function (req, res, next) {
  if (refusedSignedOut(res)) return next();

  this.on("route:BeforeComplete", function (beforeReq, beforeRes) {
    var CustomerMgr = require("dw/customer/CustomerMgr");
    var PaymentDeletedData = require("*/cartridge/scripts/data/PaymentDeletedData");

    var customer = CustomerMgr.getCustomerByCustomerNumber(
      beforeReq.currentCustomer.profile.customerNo
    );

    answer(
      beforeRes,
      PaymentDeletedData.from({
        uuid: beforeReq.querystring.UUID,
        remaining: customer.getProfile().getWallet().getPaymentInstruments().length,
      })
    );
  });

  return next();
});

module.exports = server.exports();
