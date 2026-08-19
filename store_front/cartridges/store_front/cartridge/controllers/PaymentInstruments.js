"use strict";

/**
 * @namespace PaymentInstruments
 */

const server = require("server");
server.extend(module.superModule);

// The reset-then-json seam, shared with Cart.js, Account.js and Address.js.
var answer = require("*/cartridge/scripts/helpers/answerJson").answerJson;

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

module.exports = server.exports();
