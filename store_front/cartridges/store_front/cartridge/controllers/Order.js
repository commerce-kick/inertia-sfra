"use strict";

/**
 * @namespace Order
 */

const server = require("server");
server.extend(module.superModule);

var initInertia = require("*/cartridge/scripts/middleware/initInertia");
var shareData = require("*/cartridge/scripts/middleware/shareData");

/**
 * Order-Confirm: the order exists, and this says so.
 *
 * A POST, as base wrote it: the order number and its token travel in the body
 * rather than the URL, so a placed order is not sitting in browser history or
 * leaking through a referrer. `router.post` from the review stage carries
 * base's own two field names.
 *
 * Base's checks are all kept — both fields present, the order resolvable by
 * number *and* token, and the order belonging to whoever is asking — and each
 * failure renders base's standalone error template, untouched, which a
 * pending render leaves alone.
 *
 * One repair. Base guards against re-rendering the same confirmation twice by
 * comparing its remembered order against `req.querystring.ID` — but this
 * route is a POST and reads everything else off `req.form`, so the comparison
 * was against `undefined` and the guard never fired; it then *stored*
 * `undefined`, so it never could. Both sides now read `req.form.orderID`,
 * which is what base meant: seeing the same confirmation a second time sends
 * the shopper home.
 *
 * Deferred: base offers a guest the chance to turn this order into an account
 * (a password form posting to Order-CreateAccount). That is row 7.6 and
 * arrives with it; `returningCustomer` already says which shopper is looking.
 *
 * @formParam orderID required string the order number
 * @formParam orderToken required string the token that authorizes seeing it
 */
server.append("Confirm", initInertia.init, shareData, function (req, res, next) {
  var OrderConfirmationData = require("*/cartridge/scripts/data/OrderConfirmationData");

  var viewData = res.getViewData();

  // Base answered a bad token or a missing order by rendering its own error
  // template; leave that standing rather than overriding it with an empty
  // confirmation.
  if (!viewData.order) return next();

  var lastOrderId = Object.prototype.hasOwnProperty.call(req.session.raw.custom, "orderID")
    ? req.session.raw.custom.orderID
    : null;

  if (lastOrderId && lastOrderId === req.form.orderID) {
    var URLUtils = require("dw/web/URLUtils");
    res.redirect(URLUtils.url("Home-Show"));
    return next();
  }

  res.inertia.render("Order/Confirm", {
    confirmation: OrderConfirmationData.fromModel(
      viewData.order,
      Boolean(viewData.returningCustomer)
    ),
  });

  req.session.raw.custom.orderID = req.form.orderID; // eslint-disable-line no-param-reassign

  return next();
});

module.exports = server.exports();
