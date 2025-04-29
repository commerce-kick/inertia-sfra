"use strict";

/**
 * @namespace Search
 */

const server = require("server");
server.extend(module.superModule);

const sharedData = require("*/cartridge/scripts/middleware/sharedData");
const inertia = require("*/cartridge/scripts/middleware/inertiaMiddleware");
const utils = require("*/cartridge/helpers/utils");

server.append("UpdateGrid", function (req, res, next) {
  var ProductFactory = require("*/cartridge/scripts/factories/product");
  const viewData = res.getViewData();

  var products = viewData.productSearch.productIds.map(function (product) {
    return {
      id: product.productID,
      product: ProductFactory.get({
        pid: product.productID,
        quantity: 1,
      }),
    };
  });

  res.json({
    products: products,
    showMore: viewData.productSearch.showMoreUrl.toString(),
  });

  next();
});

server.append(
  "Show",
  function (req, res, next) {
    const viewData = res.getViewData();

    const query = viewData.queryString;

    const page = dw.experience.PageMgr.serializePage("homepage", null);
    page;

    res.setViewData({
      template: "Search/Show",
      props: {
        refinements: viewData.productSearch.refinements,
        productSort: viewData.productSearch.productSort,
        count: viewData.productSearch.count,
        showMore: viewData.productSearch.showMoreUrl.toString(),
        cgid: viewData.productSearch.category.id,
        query: viewData.queryString,
        resetLink: viewData.productSearch.resetLink.toString(),
      },
    });

    next();
  },
  sharedData.inertiaSharedData,
  inertia.inertiaMiddleware
);

server.append("ShowAjax", function (req, res, next) {
  const viewData = res.getViewData();

  res.json(viewData);

  next();
});

/* This its a test to render 15K entries on a 5Mb json */
server.get(
  "Five",
  function (req, res, next) {
    const fiveJson = require("*/cartridge/scripts/five");

    res.setViewData({
      template: "Search/Five",
      props: {
        data: fiveJson,
      },
    });

    next();
  },
  sharedData.inertiaSharedData,
  inertia.inertiaMiddleware
);

module.exports = server.exports();
