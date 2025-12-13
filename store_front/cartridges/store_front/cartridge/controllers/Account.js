"use strict";

/**
 * @namespace Account
 */

const server = require("server");
server.extend(module.superModule);

const inertia = require("*/cartridge/scripts/middleware/inertiaMiddleware");
const sharedData = require("*/cartridge/scripts/middleware/shareData");

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
  sharedData,
  inertia.render
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
  sharedData,
  inertia.render
);

module.exports = server.exports();
