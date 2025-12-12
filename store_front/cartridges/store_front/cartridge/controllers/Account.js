"use strict";

/**
 * @namespace Account
 */

const server = require("server");
server.extend(module.superModule);

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
  inertia.shareData,
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
  inertia.shareData,
  inertia.render
);

module.exports = server.exports();
