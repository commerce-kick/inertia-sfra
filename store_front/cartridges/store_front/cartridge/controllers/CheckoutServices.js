"use strict";

/**
 * @namespace CheckoutServices
 */

const server = require("server");
server.extend(module.superModule);

var answerCheckout = require("*/cartridge/scripts/helpers/answerCheckout").answerCheckout;
var answerJson = require("*/cartridge/scripts/helpers/answerJson");

/**
 * CheckoutServices-Get: the basket, as checkout reads it.
 *
 * Base built this route for multi-ship — its jQuery called it when moving to
 * the payment stage to pick up totals the shipping stage had changed. The
 * port answers the same `CheckoutOrderData` every other checkout route does,
 * which makes it the plain "re-read the checkout" call: `useCheckout`.
 *
 * Base's `allValid` check (does every shipment have an address a method can
 * serve) survives as `order.shippable`, and its no-basket branch already
 * carried a `redirectUrl` to the bag, which the envelope now delivers.
 */
server.append("Get", function (req, res, next) {
  answerCheckout(res);

  return next();
});

/**
 * CheckoutServices-SubmitCustomer: the guest's email address.
 *
 * The first stage of checkout asks a guest for one thing, and base does the
 * whole job: it validates the address, writes it onto the basket, and
 * re-renders the order. This appends a `route:BeforeComplete` after base's —
 * base does its work in one — and retypes the answer.
 *
 * @formParam dwfrm_coCustomer_email required string where the order confirmation goes
 */
server.append("SubmitCustomer", function (req, res, next) {
  this.on("route:BeforeComplete", function (beforeReq, beforeRes) {
    answerCheckout(beforeRes);
  });

  return next();
});

/**
 * CheckoutServices-LoginCustomer: sign in from inside checkout.
 *
 * The same credentials Account-Login takes, asked at the checkout gate
 * instead of on the sign-in page, and base does more than authenticate: the
 * session transforms on login, so it re-issues the CSRF token. That token is
 * dropped from the answer here — the port's token is an `always()` shared
 * prop, so the visit that follows the redirect carries a fresh one, and a
 * token in a JSON body would be a second source of truth for it.
 *
 * A wrong password is base's `customerErrorMessage`, which becomes the
 * envelope's message: it belongs above the two fields, not on either.
 *
 * @formParam dwfrm_coRegisteredCustomer_email required string the account's email address
 * @formParam dwfrm_coRegisteredCustomer_password required string the account's password
 */
server.append("LoginCustomer", function (req, res, next) {
  this.on("route:BeforeComplete", function (beforeReq, beforeRes) {
    answerCheckout(beforeRes);
  });

  return next();
});

/**
 * CheckoutServices-SubmitPayment: the billing address and the card.
 *
 * Base validates the billing form, hands the card to the payment processor's
 * `Handle` hook (RefArch's `basic_credit`, which asks the platform whether
 * the number, type and expiry are usable), and — when that passes — puts the
 * payment instrument on the basket. None of it is reimplemented.
 *
 * This is the row the ledger expected to land BLOCKED for want of a payment
 * processor. It does not: `basic_credit` is RefArch's own processor and needs
 * no gateway — its `Authorize` writes a transaction ID and nothing leaves the
 * instance. What cannot be done here is *verifying* it, since the sandbox is
 * retired; the row is ported, not exercised.
 *
 * @formParam dwfrm_billing_addressFields_firstName required string given name
 * @formParam dwfrm_billing_addressFields_lastName required string family name
 * @formParam dwfrm_billing_addressFields_address1 required string street line
 * @formParam dwfrm_billing_addressFields_address2 optional string second street line
 * @formParam dwfrm_billing_addressFields_city required string city
 * @formParam dwfrm_billing_addressFields_states_stateCode required string state or province code
 * @formParam dwfrm_billing_addressFields_postalCode required string postal code
 * @formParam dwfrm_billing_addressFields_country required string ISO country code
 * @formParam dwfrm_billing_contactInfoFields_phone required string phone number
 * @formParam dwfrm_billing_paymentMethod required string the payment method ID, CREDIT_CARD
 * @formParam dwfrm_billing_creditCardFields_cardOwner required string the name on the card
 * @formParam dwfrm_billing_creditCardFields_cardNumber required string the card number
 * @formParam dwfrm_billing_creditCardFields_cardType required string card type, derived from the number
 * @formParam dwfrm_billing_creditCardFields_expirationMonth required number expiry month
 * @formParam dwfrm_billing_creditCardFields_expirationYear required number expiry year
 * @formParam dwfrm_billing_creditCardFields_securityCode required string the card's security code
 * @formParam storedPaymentUUID optional string a saved card to pay with instead of a new one
 * @formParam addressSelector optional string which address the billing form was filled from
 */
server.append("SubmitPayment", function (req, res, next) {
  this.on("route:BeforeComplete", function (beforeReq, beforeRes) {
    answerCheckout(beforeRes);
  });

  return next();
});

/**
 * CheckoutServices-PlaceOrder: create the order.
 *
 * The last call of the flow, and the one that must not be retyped carelessly:
 * base runs the fraud hooks, authorizes the payment, places the order, sends
 * the confirmation email and empties the basket, answering a dozen different
 * refusals along the way (an unavailable product, an invalid address, a
 * declined card). Every one of those is `{error: true, errorMessage}` and
 * becomes the envelope, so the button reports what actually happened.
 *
 * Success is `PlacedOrderData` — the order number, the token that lets a
 * guest see it without an account, and base's own continue URL.
 */
server.append("PlaceOrder", function (req, res, next) {
  var PlacedOrderData = require("*/cartridge/scripts/data/PlacedOrderData");

  var viewData = res.getViewData();

  if (viewData.error || !viewData.orderID) {
    answerJson.answerError(res, viewData.errorMessage, viewData.redirectUrl);
    return next();
  }

  answerJson.answerJson(
    res,
    PlacedOrderData.from({
      orderId: viewData.orderID,
      orderToken: viewData.orderToken,
      continueUrl: viewData.continueUrl,
    })
  );

  return next();
});

module.exports = server.exports();
