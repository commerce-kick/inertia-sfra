"use strict";

/**
 * @namespace Search
 */

const server = require("server");
server.extend(module.superModule);

const inertia = require("*/cartridge/scripts/middleware/inertiaMiddleware");
const sharedData = require("*/cartridge/scripts/middleware/shareData");
const utils = require("*/cartridge/helpers/utils.js");

server.append("UpdateGrid", function (req, res, next) {
  const viewData = res.getViewData();
  var ProductFactory = require("*/cartridge/scripts/factories/product");

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

    var ProductFactory = require("*/cartridge/scripts/factories/product");

    var productTiles = viewData.productSearch.productIds.map(function (
      product
    ) {
      return ProductFactory.get({
        pid: product.productID,
        quantity: 1,
      });
    });

    const products = utils.buildScroll(productTiles, {
      start: req.querystring.start,
      sz: req.querystring.sz,
      total: viewData.productSearch.count,
    });

    res.setViewData({
      template: "Search/Show",
      props: {
        products: products,
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
  sharedData,
  inertia.render
);

server.append("ShowAjax", function (req, res, next) {
  const viewData = res.getViewData();

  res.json(viewData);

  next();
});

module.exports = server.exports();
