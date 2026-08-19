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

/**
 * Account-SubmitRegistration: create an account and sign into it.
 *
 * Base creates the customer, authenticates, logs in, copies the profile
 * fields, emails a welcome note and resolves the same `rurl` index the login
 * route does — all inside a `route:BeforeComplete` handler, because the
 * account must exist before the answer is written. An appended step therefore
 * runs *before* base has decided anything, so this registers a
 * `route:BeforeComplete` of its own; handlers fire in registration order, and
 * ours registers last (after base's and after plugin_wishlists', which merges
 * the guest wish list into the new account off `authenticatedCustomer`).
 *
 * Base answers three different ways and this normalizes all three: a valid
 * registration (`{success, redirectUrl}`, typed), a form base refused
 * (`{fields}` — a map of message per form field name, kept, because that is
 * the key the register form already renders each input under), and a creation
 * that threw (a 500 with `errorMessage`, which rejects in the browser before
 * anything reads the body — normalized to the error envelope).
 *
 * Base's own validation stands: the email/confirm and password/confirm
 * matches, and `CustomerMgr.isAcceptablePassword` against the site's password
 * policy, which no client-side rule can know.
 *
 * @queryParam rurl optional number where to go once registered — 1 Account-Show, 2 Checkout-Begin
 * @formParam dwfrm_profile_customer_firstname required string given name
 * @formParam dwfrm_profile_customer_lastname required string family name
 * @formParam dwfrm_profile_customer_phone required string phone number
 * @formParam dwfrm_profile_customer_email required string email address, the account's login
 * @formParam dwfrm_profile_customer_emailconfirm required string the email address again
 * @formParam dwfrm_profile_login_password required string the new password
 * @formParam dwfrm_profile_login_passwordconfirm required string the new password again
 * @formParam dwfrm_profile_customer_addtoemaillist optional boolean opt in to the mailing list
 */
server.append("SubmitRegistration", function (req, res, next) {
  this.on("route:BeforeComplete", function (beforeReq, beforeRes) {
    var AuthResultData = require("*/cartridge/scripts/data/AuthResultData");

    var viewData = beforeRes.getViewData();

    if (viewData.errorMessage) {
      answerError(beforeRes, viewData.errorMessage);
      return;
    }

    answer(beforeRes, AuthResultData.fromViewData(viewData));
  });

  return next();
});

/**
 * Account-PasswordResetDialogForm: ask for a reset link.
 *
 * Base validates the address, looks the customer up and — only if one exists
 * — emails the reset link, while answering the *same* success either way. That
 * silence is the feature: an answer that differed would turn the form into a
 * test for whether an address has an account here. It is kept exactly.
 *
 * `AuthResultData` again: the shape is the one it already describes — a
 * verdict, somewhere to go next (base's `returnUrl`, back to sign-in), and a
 * per-field message when the address itself will not do. Base's four copy
 * fields (`receivedMsgHeading`, `receivedMsgBody`, `buttonText`) and its
 * `mobile` echo are gone: copy is English and written in the component, and
 * `mobile` only ever told base's jQuery whether it was answering the modal or
 * the page — the port has one surface for both.
 *
 * @formParam loginEmail required string the address to send the reset link to
 */
server.append("PasswordResetDialogForm", function (req, res, next) {
  var AuthResultData = require("*/cartridge/scripts/data/AuthResultData");

  var viewData = res.getViewData();

  answer(
    res,
    AuthResultData.from({
      success: viewData.success,
      redirectUrl: viewData.returnUrl,
      fields: viewData.fields,
    })
  );

  return next();
});

module.exports = server.exports();
