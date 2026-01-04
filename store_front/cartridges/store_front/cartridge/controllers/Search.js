"use strict";

/**
 * @namespace Search
 */

const server = require("server");
server.extend(module.superModule);

var initInertia = require("*/cartridge/scripts/middleware/initInertia");
var shareData = require("*/cartridge/scripts/middleware/shareData");

server.append("Show", initInertia.init, shareData, function (req, res, next) {
  const viewData = res.getViewData();

  const products = res.inertia.scroll(() => {
    var ProductFactory = require("*/cartridge/scripts/factories/product");

    var productTiles = viewData.productSearch.productIds.map(function (
      product
    ) {
      return ProductFactory.get({
        pid: product.productID,
        quantity: 1,
      });
    });

    return res.inertia.createPaginator(
      productTiles,
      viewData.productSearch.count
    );
  });

  res.inertia.render("Search/Show", {
    products: products,
  });

  next();
});

module.exports = server.exports();
