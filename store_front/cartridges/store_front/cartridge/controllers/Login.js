"use strict";

/**
 * @namespace Login
 */

const server = require("server");
server.extend(module.superModule);

const inertia = require("*/cartridge/scripts/middleware/inertiaMiddleware");
const sharedData = require("*/cartridge/scripts/middleware/shareData");

server.append(
  "Show",
  function (req, res, next) {
    const URLUtils = require("dw/web/URLUtils");
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
  sharedData,
  inertia.render
);

module.exports = server.exports();
