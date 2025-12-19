"use strict";

/**
 * @namespace Home
 */

const server = require("server");
server.extend(module.superModule);

const inertia = require("*/cartridge/scripts/middleware/inertiaMiddleware");
const sharedData = require("*/cartridge/scripts/middleware/shareData");
const utils = require("*/cartridge/helpers/utils");
const ProductSearchModel = require("dw/catalog/ProductSearchModel");

server.append(
  "Show",
  function (req, res, next) {
    const category = "newarrivals-womens";

    const defer = utils.defer(function () {
      const ProductData = require("*/cartridge/scripts/data/ProductData");

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

        let result = ProductData.from(product);

        products.push(result);

        productCount++;
      }

      return products;
    });

    res.setViewData({
      template: "Home/Show",
      props: {
        recommendedProducts: defer,
        viewAllLink: dw.web.URLUtils.url(
          "Search-Show",
          "cgid",
          category
        ).toString(),
      },
    });

    next();
  },
  sharedData,
  inertia.render
);

module.exports = server.exports();
