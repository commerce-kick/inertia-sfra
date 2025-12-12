"use strict";

/**
 * @namespace Product
 */

const server = require("server");
server.extend(module.superModule);

const inertia = require("*/cartridge/scripts/middleware/inertiaMiddleware");

/**
 * Display product details page
 * 
 * @queryParam pid required string the product ID to display
 */
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
  inertia.shareData,
  inertia.render
);

module.exports = server.exports();
