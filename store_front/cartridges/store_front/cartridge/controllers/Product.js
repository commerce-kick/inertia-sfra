"use strict";

/**
 * @namespace Product
 */

const server = require("server");
server.extend(module.superModule);

var initInertia = require("*/cartridge/scripts/middleware/initInertia");
var shareData = require("*/cartridge/scripts/middleware/shareData");

/**
 * Product-Show: the PDP. Base SFRA Product-Show computes the full product
 * model in viewData; this appended step replaces the ISML render with a
 * trimmed, typed slice of it.
 *
 * @queryParam pid required string the product ID to display
 */
server.append("Show", initInertia.init, shareData, function (req, res, next) {
  var ProductDetailData = require("*/cartridge/scripts/data/ProductDetailData");

  var viewData = res.getViewData();

  res.inertia.render("Product/Show", {
    product: ProductDetailData.fromModel(viewData.product),
    breadcrumbs: (viewData.breadcrumbs || []).map(function (crumb) {
      return {
        htmlValue: crumb.htmlValue,
        url: crumb.url ? crumb.url.toString() : "",
      };
    }),
  });

  next();
});

module.exports = server.exports();
