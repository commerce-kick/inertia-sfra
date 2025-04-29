"use strict";

/**
 * @namespace Account
 */

const server = require("server");
server.extend(module.superModule);

const sharedData = require("*/cartridge/scripts/middleware/sharedData");
const inertia = require("*/cartridge/scripts/middleware/inertiaMiddleware");

const ProductSearchModel = require("dw/catalog/ProductSearchModel");
const ProductMgr = require("dw/catalog/ProductMgr");

server.append(
  "Show",
  function (req, res, next) {
    const category = "newarrivals-womens";

    var ProductFactory = require("*/cartridge/scripts/factories/product");
    // Create a new product search
    const productSearch = new ProductSearchModel();
    productSearch.setCategoryID(category);
    productSearch.search();

    const products = [];
    let productCount = 0;

    const iter = productSearch.getProductSearchHits();

    while (iter !== null && iter.hasNext() && productCount < 6) {
      let productSearchHit = iter.next();
      let product = ProductFactory.get({
        pid: productSearchHit.getProduct().ID,
        quantity: 1,
      });
      products.push(product);
      productCount++;
    }

    res.setViewData({
      template: "Home/Show",
      props: {
        recommendedProducts: products,
        viewAllLink: dw.web.URLUtils.url("Search-Show", "cgid", category).toString(),
      },
    });

    next();
  },
  sharedData.inertiaSharedData,
  inertia.inertiaMiddleware
);

module.exports = server.exports();
