"use strict";

/**
 * @namespace Product
 */

const server = require("server");
server.extend(module.superModule);

const sharedData = require("*/cartridge/scripts/middleware/sharedData");
const inertia = require("*/cartridge/scripts/middleware/inertiaMiddleware");

server.append(
  "Show",
  function (req, res, next) {
    const viewData = res.getViewData();

    const bread = viewData.breadcrumbs.map((b) => {
      return {
        htmlValue: b.htmlValue,
        url: b.url.toString(),
      };
    });

    res.setViewData({
      template: "Product/Show",
      props: {
        breadcrumbs: bread,
        product: viewData.product,
        addToCartUrl: viewData.addToCartUrl.toString(),
      },
    });

    next();
  },
  sharedData.inertiaSharedData,
  inertia.inertiaMiddleware
);

module.exports = server.exports();
