"use strict";

/**
 * @namespace Account
 */

const server = require("server");
server.extend(module.superModule);

// The reset-then-json seam and the failure envelope, shared with Cart.js.
var answerJson = require("*/cartridge/scripts/helpers/answerJson");
var answer = answerJson.answerJson;
var answerError = answerJson.answerError;

/**
 * Account-Login: exchange credentials for a session.
 *
 * Base does the whole job — it authenticates, honours "remember me", emails
 * the shopper when the account locks, and resolves where they go next out of
 * the `rurl` index (1 → Account-Show, 2 → Checkout-Begin, per
 * config/oAuthRenentryRedirectEndpoints). All of it is worth keeping, so this
 * appends and retypes only the answer.
 *
 * It is deliberately the *last* append: plugin_wishlists appends here too, to
 * merge the guest wish list into the account it just signed into, and it
 * reads `authenticatedCustomer` off view data. Resetting view data before
 * that ran would take the list merge with it.
 *
 * Base answered a refusal as `{ error: [message] }` — an array the client
 * envelope never reads, so a wrong password would have surfaced as
 * "Something went wrong". The message now travels in the envelope
 * `app/lib/queries/sfra.ts` unwraps, which is where the login form reads it.
 *
 * Base's `csrfProtection.validateAjaxRequest` stands: on a stale token it
 * redirects to CSRF-AjaxFail, whose `csrfError` the client already handles by
 * reloading the props that carry a fresh token.
 *
 * @queryParam rurl optional number where to go once signed in — 1 Account-Show, 2 Checkout-Begin
 * @formParam loginEmail required string the account's email address
 * @formParam loginPassword required string the account's password
 * @formParam loginRememberMe optional boolean keep the username for next time
 */
server.append("Login", function (req, res, next) {
  var AuthResultData = require("*/cartridge/scripts/data/AuthResultData");

  var viewData = res.getViewData();
  var errors = viewData.error;

  if (errors) {
    answerError(res, Array.isArray(errors) ? errors[0] : errors);
    return next();
  }

  answer(res, AuthResultData.fromViewData(viewData));
  return next();
});

module.exports = server.exports();
