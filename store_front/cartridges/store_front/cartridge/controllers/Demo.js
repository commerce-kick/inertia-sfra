"use strict";

/**
 * @namespace Account
 */

const server = require("server");

const sharedData = require("*/cartridge/scripts/middleware/sharedData");
const inertia = require("*/cartridge/scripts/middleware/inertiaMiddleware");

const ssrService = require("*/cartridge/scripts/services/inertiaSsr");

server.get(
  "Show",
  function (req, res, next) {
    const viewData = res.getViewData();

    res.setViewData({
      template: "Demo/Demo",
      props: {},
    });

    next();
  },
  sharedData.inertiaSharedData,
  inertia.inertiaMiddleware
);

server.post(
  "Post",
  function (req, res, next) {
    var id = req.form.orderId;

    res.setViewData({
      template: "Demo/Post",
      props: {},
    });

    next();
  },
  sharedData.inertiaSharedData,
  inertia.inertiaMiddleware
);

module.exports = server.exports();
