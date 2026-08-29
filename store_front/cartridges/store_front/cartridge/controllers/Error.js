"use strict";

/**
 * @namespace Error
 */

var server = require("server");
// var Resource = require("dw/web/Resource");
// var consentTracking = require("*/cartridge/scripts/middleware/consentTracking");
// const inertia = require("*/cartridge/scripts/middleware/inertiaMiddleware");
// const sharedData = require("*/cartridge/scripts/middleware/shareData");

// server.use(
//   "Start",
//   consentTracking.consent,
//   function (req, res, next) {
//     res.setViewData({
//       template: "Error/Start",
//       props: {
//         status: 500,
//       },
//     });

//     next();
//   },
//   sharedData,
//   inertia.render
// );


// server.use("ErrorCode", consentTracking.consent, function (req, res, next) {
//   res.setStatusCode(500);
//   var errorMessage = "message.error." + req.querystring.err;

//   res.render("error", {
//     //@ts-ignore
//     error: req.error || {},
//     message: Resource.msg(errorMessage, "error", null),
//   });
//   next();
// });


// server.get("Forbidden", consentTracking.consent, function (req, res, next) {
//   var URLUtils = require("dw/web/URLUtils");
//   var CustomerMgr = require("dw/customer/CustomerMgr");

//   CustomerMgr.logoutCustomer(true);
//   res.redirect(URLUtils.url("Home-Show"));
//   next();
// });

module.exports = server.exports();
