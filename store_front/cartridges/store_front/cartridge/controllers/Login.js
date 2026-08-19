"use strict";

/**
 * @namespace Login
 */

const server = require("server");
server.extend(module.superModule);

var initInertia = require("*/cartridge/scripts/middleware/initInertia");
var shareData = require("*/cartridge/scripts/middleware/shareData");

// Base hands its OAuth template a fixed re-entry index (1 → Account-Show,
// per config/oAuthRenentryRedirectEndpoints) and the two providers RefArch
// ships. Both are kept as base had them.
var OAUTH_PROVIDERS = [
  { id: "Google", label: "Continue with Google" },
  { id: "Facebook", label: "Continue with Facebook" },
];
var OAUTH_REENTRY_ENDPOINT = 1;

/**
 * Login-Show: the sign-in surface — sign in and register on one page.
 *
 * Base already prepares everything the page needs: it clears the `profile`
 * form, reads the remembered username off the customer's credentials, and
 * decides which of the two panes opens from the `action` parameter. So this
 * appends and swaps only the render.
 *
 * The registration fields arrive as data, not markup: `ProfileFormData`
 * carries the label, the required flag and the length/pattern constraints the
 * site's form definition declares, so the browser enforces the same rules the
 * server will. Base printed the same facts as an attributes string.
 *
 * The OAuth destinations are server-authored rather than built from a
 * generated helper for one reason: base builds them with `URLUtils.https`,
 * and initiating an OAuth flow over http is not the same URL.
 *
 * Two departures from base, both deliberate:
 *  - an authenticated shopper is sent to Account-Show instead of being shown
 *    a sign-in form they have already satisfied;
 *  - base's guest order-tracking card, which shares this page, posts to
 *    Order-Track and arrives with that row (7.5).
 *
 * Base's breadcrumb trail here is a single Home link — the header wordmark
 * already is that link, so it is not carried over.
 *
 * @queryParam rurl optional number where to go once signed in — 1 Account-Show, 2 Checkout-Begin
 * @queryParam action optional string which pane opens: "login" (default) or "register"
 */
server.append("Show", initInertia.init, shareData, function (req, res, next) {
  var URLUtils = require("dw/web/URLUtils");
  var ProfileFormData = require("*/cartridge/scripts/data/ProfileFormData");

  if (customer.isAuthenticated()) {
    res.redirect(URLUtils.url("Account-Show"));
    return next();
  }

  var viewData = res.getViewData();

  res.inertia.render("Login/Show", {
    tab: viewData.navTabValue === "register" ? "register" : "login",
    rurl: parseInt(req.querystring.rurl, 10) || 1,
    login: {
      email: viewData.userName || "",
      rememberMe: Boolean(viewData.rememberMe),
    },
    register: ProfileFormData.fromForm(viewData.profileForm),
    oauth: OAUTH_PROVIDERS.map(function (provider) {
      return {
        id: provider.id,
        label: provider.label,
        url: URLUtils.https(
          "Login-OAuthLogin",
          "oauthProvider",
          provider.id,
          "oauthLoginTargetEndPoint",
          OAUTH_REENTRY_ENDPOINT
        ).toString(),
      };
    }),
  });

  return next();
});

module.exports = server.exports();
