"use strict";

/**
 * @namespace Account
 */

const server = require("server");
server.extend(module.superModule);

const sharedData = require("*/cartridge/scripts/middleware/sharedData");
const inertia = require("*/cartridge/scripts/middleware/inertiaMiddleware");

server.append(
  "Show",
  function (req, res, next) {
    const viewData = res.getViewData();

    res.setViewData({
      template: "Account/Dashboard",
      props: viewData,
    });

    next();
  },
  sharedData.inertiaSharedData,
  inertia.inertiaMiddleware
);

server.append(
  "EditProfile",
  function (req, res, next) {
    const viewData = res.getViewData();

    res.setViewData({
      template: "Account/EditProfile",
      props: viewData,
    });

    next();
  },
  sharedData.inertiaSharedData,
  inertia.inertiaMiddleware
);

module.exports = server.exports();
