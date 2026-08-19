"use strict";

/**
 * @namespace Product
 */

const server = require("server");
server.extend(module.superModule);

var initInertia = require("*/cartridge/scripts/middleware/initInertia");
var shareData = require("*/cartridge/scripts/middleware/shareData");
var cache = require("*/cartridge/scripts/middleware/cache");

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

/**
 * Product-ShowQuickView: the PLP quick look.
 *
 * Base renders product/quickView.isml to an HTML string and returns it as
 * `renderedTemplate` for jQuery to inject. That markup is Bootstrap-shaped and
 * cannot be reconciled with DESIGN.md, so this replaces the route outright and
 * answers the same typed product the PDP renders. Replacing also skips three
 * ISML fragment renders (attributes, promotions, options) the JSON never used.
 *
 * @queryParam pid required string the product ID to preview
 */
server.replace("ShowQuickView", cache.applyPromotionSensitiveCache, function (req, res, next) {
  var URLUtils = require("dw/web/URLUtils");
  var ProductFactory = require("*/cartridge/scripts/factories/product");
  var ProductDetailData = require("*/cartridge/scripts/data/ProductDetailData");

  var product = ProductFactory.get(req.querystring);

  res.json({
    product: ProductDetailData.fromModel(product),
    productUrl: URLUtils.url("Product-Show", "pid", product.id).relative().toString(),
  });

  next();
});

/**
 * Product-Variation: re-resolve a product against a variation selection.
 *
 * The PDP does not use this — there, selecting a value is a partial visit to
 * Product-Show, so the choice lands in the URL (see ProductDetailData). This
 * exists for callers that must not navigate: quickview swaps variants inside
 * its dialog, on the PLP.
 *
 * Base built three ISML fragments and a price HTML blob for the jQuery PDP to
 * splice in; none survive a typed client, so this replaces the route.
 *
 * @queryParam pid required string the master or variant product ID
 * @queryParam quantity optional number selected quantity
 */
server.replace("Variation", function (req, res, next) {
  var ProductFactory = require("*/cartridge/scripts/factories/product");
  var ProductDetailData = require("*/cartridge/scripts/data/ProductDetailData");

  res.json({
    product: ProductDetailData.fromModel(ProductFactory.get(req.querystring)),
  });

  next();
});

/**
 * Product-SizeChart: the sizing table behind the PDP's "Size guide" link.
 *
 * The chart is a content asset whose body is authored markup, so the payload
 * is HTML either way. Base answered an untyped `{success, content}` — or a
 * bare `{}` on a miss; this replaces the route so SizeChartData owns the wire
 * shape and the miss arrives as `success: false` instead of an absent key.
 *
 * `cid` comes from the product model (ProductDetailData.sizeChartId, set by
 * the base sizeChart decorator from the category's sizeChartID) — the
 * frontend never invents it.
 *
 * @queryParam cid required string the size-chart content asset ID
 */
server.replace("SizeChart", function (req, res, next) {
  var ContentMgr = require("dw/content/ContentMgr");
  var SizeChartData = require("*/cartridge/scripts/data/SizeChartData");

  res.json(SizeChartData.fromContent(ContentMgr.getContent(req.querystring.cid)));

  next();
});

module.exports = server.exports();
