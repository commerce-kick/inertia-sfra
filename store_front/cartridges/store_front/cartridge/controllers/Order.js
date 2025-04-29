"use strict";

/**
 * @namespace Order
 */

const server = require("server");
server.extend(module.superModule);

const sharedData = require("*/cartridge/scripts/middleware/sharedData");
const inertia = require("*/cartridge/scripts/middleware/inertiaMiddleware");

server.append(
  "Confirm",
  function (req, res, next) {
    var reportingUrlsHelper = require("*/cartridge/scripts/reportingUrls");
    var OrderMgr = require("dw/order/OrderMgr");
    var OrderModel = require("*/cartridge/models/order");
    var Locale = require("dw/util/Locale");

    var id = req.form.orderID;

    var order;

    var currentLocale = Locale.getLocale(req.locale.id);

    var config = {
      numberOfLineItems: "*",
    };

    order = OrderMgr.getOrder(req.form.orderID, req.form.orderToken);

    var orderModel = new OrderModel(order, {
      config: config,
      countryCode: currentLocale.country,
      containerView: "order",
    });

    res.setViewData({
      template: "Checkout/Thanks",
      props: {
        order: orderModel,
        orderUUID: order.getUUID(),
      },
    });

    next();
  },
  sharedData.inertiaSharedData,
  inertia.inertiaMiddleware
);

server.append(
  "Details",
  function (req, res, next) {
    const viewData = res.getViewData();

    res.setViewData({
      template: "Order/Details",
      props: viewData,
    });

    next();
  },
  sharedData.inertiaSharedData,
  inertia.inertiaMiddleware
);

server.append("History", function (req, res, next) {
  const viewData = res.getViewData();

  res.json(viewData);

  next();
});

module.exports = server.exports();
