"use strict";

/**
 * @namespace Login
 */

const server = require("server");
server.extend(module.superModule);

const sharedData = require("*/cartridge/scripts/middleware/sharedData");
const inertia = require("*/cartridge/scripts/middleware/inertiaMiddleware");

server.append(
  "Show",
  function (req, res, next) {
    const URLUtils = require("dw/web/URLUtils");
    const c = customer.isAuthenticated();
    const viewData = res.getViewData();

    if (customer.isAuthenticated()) {
      res.redirect(URLUtils.url("Account-Show"));
      return next();
    }

    res.setViewData({
      template: "Login/Show",
      props: {
        csrf: viewData.csrf,
        profileForm: viewData.profileForm,
      },
    });

    next();
  },
  sharedData.inertiaSharedData,
  inertia.inertiaMiddleware
);

module.exports = server.exports();
