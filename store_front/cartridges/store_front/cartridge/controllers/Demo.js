"use strict";

/**
 * @namespace Account
 */

const server = require("server");

const inertia = require("*/cartridge/scripts/middleware/inertiaMiddleware");

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
  inertia.shareData,
  inertia.render
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
  inertia.shareData,
  inertia.render
);

module.exports = server.exports();
