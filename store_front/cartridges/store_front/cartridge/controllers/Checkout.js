"use strict";

/**
 * @namespace Checkout
 */

const server = require("server");
server.extend(module.superModule);

var initInertia = require("*/cartridge/scripts/middleware/initInertia");
var shareData = require("*/cartridge/scripts/middleware/shareData");

/**
 * Checkout-Begin: the whole checkout, in stages.
 *
 * Base does a great deal before it renders, and every bit of it is worth
 * keeping: it refuses a missing or invalid basket by sending the shopper back
 * to the bag, copies the shopper's default address onto the shipment and the
 * billing address, makes sure no shipment is empty, revalidates the currency,
 * recalculates, and decides which stage the shopper belongs on — a signed-in
 * shopper, or one who has already given an email, skips the customer stage.
 * All of that happens before this step; the append swaps the render.
 *
 * The stage stays in the URL, as base put it there: it is the one piece of
 * checkout state worth being able to link to, reload on, and go back to. Each
 * stage advances with a visit to this route, so what a stage opens on is
 * always the basket as the server has it, not as the last answer left it.
 *
 * Base's `expirationYears` are merged onto the card form's year field by
 * `CheckoutFormsData`, exactly as 5.8 does for the account's card form.
 *
 * Dropped: `reportingURLs` (the checkout analytics beacons, row 10.4),
 * `oAuthReentryEndpoint` (the sign-in stage links to Login-Show with base's
 * `rurl` index instead of re-hosting the OAuth buttons), and the `customer`
 * account model except the two lists the selectors need — saved addresses and
 * saved cards.
 *
 * @queryParam stage optional string which stage to open — customer, shipping, payment or placeOrder
 */
server.append("Begin", initInertia.init, shareData, function (req, res, next) {
  var AddressData = require("*/cartridge/scripts/data/AddressData");
  var CheckoutFormsData = require("*/cartridge/scripts/data/CheckoutFormsData");
  var CheckoutOrderData = require("*/cartridge/scripts/data/CheckoutOrderData");
  var PaymentCardData = require("*/cartridge/scripts/data/PaymentCardData");

  var viewData = res.getViewData();
  var account = viewData.customer || {};

  res.inertia.render("Checkout/Begin", {
    order: CheckoutOrderData.fromModel(viewData.order),
    stage: viewData.currentStage || "customer",
    forms: CheckoutFormsData.fromForms(viewData.forms, viewData.expirationYears),
    registered: Boolean(account.registeredUser),
    savedAddresses: (account.addresses || []).map(function (address) {
      return AddressData.fromModel(address);
    }),
    savedCards: (account.customerPaymentInstruments || []).map(
      PaymentCardData.fromInstrument
    ),
  });

  return next();
});

module.exports = server.exports();
