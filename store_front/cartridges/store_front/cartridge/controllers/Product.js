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
 * Variant selection rides this same route. Base resolves `dwvar_<pid>_<attr>`
 * query params into the variation model before this step runs, so a partial
 * visit to a value's URL re-renders `product` as the selected variant. Those
 * params are dynamic (one per catalog attribute) and so cannot be typed here;
 * the frontend never builds them — it follows the URLs ProductDetailData
 * emits on each variation value.
 *
 * @queryParam pid required string the product ID to display
 * @queryParam quantity optional number selected quantity, carried on variation URLs
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
