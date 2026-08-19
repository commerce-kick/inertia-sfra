"use strict";

/**
 * @namespace Account
 */

const server = require("server");
server.extend(module.superModule);

var initInertia = require("*/cartridge/scripts/middleware/initInertia");
var shareData = require("*/cartridge/scripts/middleware/shareData");

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

/**
 * Account-PasswordReset: the forgotten-password surface.
 *
 * Base rendered the same form twice — once as this page (its `mobile` flag)
 * and once as a Bootstrap modal on the login page, both posting to
 * Account-PasswordResetDialogForm. The port keeps one surface: an Inertia
 * visit costs a fraction of what base's page load did, so the second copy
 * bought nothing but a second place for the form to drift.
 *
 * Nothing needs to travel with the page — the form is two fields base wrote
 * inline rather than a form definition, and where to go afterwards comes back
 * with the answer.
 */
server.append("PasswordReset", initInertia.init, shareData, function (req, res, next) {
  res.inertia.render("Account/PasswordReset", {});

  return next();
});

/**
 * Account-SaveNewPassword: the last step of the forgotten-password flow —
 * set the new password the emailed token authorizes.
 *
 * Replaced rather than appended, for a defect an append cannot reach. Base
 * does the work inside a `route:BeforeComplete` handler that reads
 * `CustomerMgr.getCustomerByToken(token).profile` unchecked — and that token
 * comes from an email, so it expires in the ordinary course of things. A
 * shopper who opens yesterday's link gets a 500 from a null dereference, and
 * an appended handler registered after base's never runs to say otherwise.
 * An expired or unknown token now answers base's own "Invalid entry. Please
 * try again." through the error envelope.
 *
 * Everything else is base's, in base's order: the confirmation match, the
 * platform's `setPasswordWithToken` (which enforces the site's password
 * policy and consumes the token), the password-changed email, and Login-Show
 * as the destination. Base signalled that destination with `res.redirect`,
 * which an XHR would follow into a whole page; it travels as `redirectUrl`
 * instead, and the hook visits it.
 *
 * @formParam token required string the reset token from the emailed link
 * @formParam dwfrm_newPasswords_newpassword required string the new password
 * @formParam dwfrm_newPasswords_newpasswordconfirm required string the new password again
 */
server.replace("SaveNewPassword", server.middleware.https, function (req, res, next) {
  var CustomerMgr = require("dw/customer/CustomerMgr");
  var Resource = require("dw/web/Resource");
  var Site = require("dw/system/Site");
  var Transaction = require("dw/system/Transaction");
  var URLUtils = require("dw/web/URLUtils");
  var emailHelpers = require("*/cartridge/scripts/helpers/emailHelpers");
  var formErrors = require("*/cartridge/scripts/formErrors");
  var AuthResultData = require("*/cartridge/scripts/data/AuthResultData");

  var passwordForm = server.forms.getForm("newPasswords");
  // Base moved the token from the query string into the body and kept
  // accepting both; so does this.
  var token = req.form.token || req.querystring.Token;

  if (passwordForm.newpassword.value !== passwordForm.newpasswordconfirm.value) {
    passwordForm.valid = false;
    passwordForm.newpassword.valid = false;
    passwordForm.newpasswordconfirm.valid = false;
    passwordForm.newpasswordconfirm.error = Resource.msg(
      "error.message.mismatch.newpassword",
      "forms",
      null
    );
  }

  if (!passwordForm.valid) {
    answer(res, AuthResultData.from({ fields: formErrors.getFormErrors(passwordForm) }));
    return next();
  }

  var invalidToken = Resource.msg("error.message.resetpassword.invalidformentry", "forms", null);
  var resettingCustomer = CustomerMgr.getCustomerByToken(token);

  if (!resettingCustomer || !resettingCustomer.profile) {
    answerError(res, invalidToken);
    return next();
  }

  var status;
  Transaction.wrap(function () {
    status = resettingCustomer.profile.credentials.setPasswordWithToken(
      token,
      passwordForm.newpassword.value
    );
  });

  if (status.error) {
    answerError(res, invalidToken);
    return next();
  }

  emailHelpers.sendEmail(
    {
      to: resettingCustomer.profile.email,
      subject: Resource.msg("subject.profile.resetpassword.email", "login", null),
      from:
        Site.current.getCustomPreferenceValue("customerServiceEmail")
        || "no-reply@testorganization.com",
      type: emailHelpers.emailTypes.passwordReset,
    },
    "account/password/passwordChangedEmail",
    {
      firstName: resettingCustomer.profile.firstName,
      lastName: resettingCustomer.profile.lastName,
      url: URLUtils.https("Login-Show"),
    }
  );

  answer(
    res,
    AuthResultData.from({
      success: true,
      redirectUrl: URLUtils.url("Login-Show").toString(),
    })
  );

  return next();
});

/**
 * Account-DoSetNewPassword: the form that sets the new password.
 *
 * Base gets here from Account-SetNewPassword's self-submitting form, which
 * exists to move the reset token out of the address bar and into a POST body.
 * That is worth keeping — a token in a URL rides in history and in referrers
 * — so the port keeps the same two-step shape, and this renders the form with
 * the token as a prop rather than as a visible parameter.
 *
 * Base redirects to Account-PasswordReset when the token does not resolve,
 * and a pending redirect breaks the middleware chain before this step, so the
 * bad-token path is base's untouched.
 *
 * @formParam token required string the reset token from the emailed link
 */
server.append("DoSetNewPassword", initInertia.init, shareData, function (req, res, next) {
  var NewPasswordFormData = require("*/cartridge/scripts/data/NewPasswordFormData");

  var viewData = res.getViewData();

  res.inertia.render("Account/SetNewPassword", {
    token: viewData.token || "",
    form: NewPasswordFormData.fromForm(viewData.passwordForm),
  });

  return next();
});

/**
 * Account-SetNewPassword: where the emailed reset link lands.
 *
 * The link carries the token as a query parameter, and base's whole reason
 * for this route is to get it out of there: it renders a form that posts the
 * token to Account-DoSetNewPassword and clicks it with a line of script, so
 * the address bar the shopper is left on holds no token. The port keeps the
 * same move — the page hands the token straight on and the URL becomes
 * Account-DoSetNewPassword — with base's own "Continue" button standing
 * behind it rather than a script that must run for the flow to proceed.
 *
 * A token that resolves to nobody is base's redirect to Account-PasswordReset,
 * untouched: a pending redirect breaks the middleware chain before this step.
 *
 * @queryParam Token required string the reset token from the emailed link
 */
server.append("SetNewPassword", initInertia.init, shareData, function (req, res, next) {
  var NewPasswordFormData = require("*/cartridge/scripts/data/NewPasswordFormData");

  var viewData = res.getViewData();

  res.inertia.render("Account/SetNewPassword", {
    token: viewData.token || "",
    form: NewPasswordFormData.fromForm(server.forms.getForm("newPasswords")),
    redirecting: true,
  });

  return next();
});

/**
 * Account-Show: the dashboard.
 *
 * Base assembles the whole account model already — profile, address book,
 * wallet, and the most recent order — and both plugin cartridges decorate the
 * same object on their way past (plugin_wishlists adds the wish list,
 * plugin_giftregistry the registries). This appends last and types a slice of
 * it: the four glances base's cards showed.
 *
 * Base's `userLoggedIn.validateLoggedIn` stands in front, so a signed-out
 * visitor is redirected to Login-Show before this step runs — a pending
 * redirect breaks the middleware chain.
 *
 * Dropped: `reportingURLs` (the account-open analytics beacon, row 10.4),
 * `viewSavedPaymentsUrl`/`addPaymentUrl` (generated route helpers), and
 * base's `********` password placeholder — a fake secret is not worth putting
 * on the wire, and the card can draw its own dots. The wish list and gift
 * registry the plugins decorate on are left untyped until their wave.
 *
 * Base's `registration=submitted` parameter is not read here: its only
 * consumer was the account-open analytics beacon, which is row 10.4. It
 * changes nothing a shopper sees, and inventing a welcome for it would be
 * inventing UI base did not have.
 */
server.append("Show", initInertia.init, shareData, function (req, res, next) {
  var AccountData = require("*/cartridge/scripts/data/AccountData");

  var viewData = res.getViewData();

  res.inertia.render("Account/Show", {
    account: AccountData.fromModel(viewData.account),
  });

  return next();
});

/**
 * Account-SaveProfile: save the edited profile.
 *
 * Base makes the change conditional on the account's own password, and does
 * it in a way worth naming: it calls `setPassword(password, password, true)`
 * — setting the password to itself — purely to have the platform verify it
 * before `setLogin` moves the email. That is the check, and it stays.
 *
 * Like registration, the work happens in base's own `route:BeforeComplete`,
 * so this registers one of its own to retype what base decided. The three
 * answers reduce to `AuthResultData` again: saved (with where to go next),
 * refused per field (a mismatched email confirmation, a password that does
 * not match, an email the platform will not accept as a login).
 *
 * @formParam dwfrm_profile_customer_firstname required string given name
 * @formParam dwfrm_profile_customer_lastname required string family name
 * @formParam dwfrm_profile_customer_phone required string phone number
 * @formParam dwfrm_profile_customer_email required string email address, which is also the login
 * @formParam dwfrm_profile_customer_emailconfirm required string the email address again
 * @formParam dwfrm_profile_login_password required string the account's current password, which authorizes the change
 */
server.append("SaveProfile", function (req, res, next) {
  this.on("route:BeforeComplete", function (beforeReq, beforeRes) {
    var AuthResultData = require("*/cartridge/scripts/data/AuthResultData");

    answer(beforeRes, AuthResultData.fromViewData(beforeRes.getViewData()));
  });

  return next();
});

module.exports = server.exports();
