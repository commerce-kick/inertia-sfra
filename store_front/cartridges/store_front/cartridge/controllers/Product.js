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
 * Render the PDP. Both product routes answer the same page with the same
 * props; only the breadcrumb trail differs, so it is passed in.
 * @param {Object} res - the SFRA response
 * @param {Array} breadcrumbs - SFRA breadcrumb objects, outermost first
 * @returns {void}
 */
function renderProductDetail(res, breadcrumbs) {
  var ProductDetailData = require("*/cartridge/scripts/data/ProductDetailData");

  var viewData = res.getViewData();

  // Base answers an offline product with a 404 and error/notFound, leaving no
  // product on viewData. Leave that render standing rather than overriding it
  // with an empty PDP.
  if (!viewData.product) return;

  res.inertia.render("Product/Show", {
    product: ProductDetailData.fromModel(viewData.product),
    breadcrumbs: (breadcrumbs || []).map(function (crumb) {
      return {
        htmlValue: crumb.htmlValue,
        url: crumb.url ? crumb.url.toString() : "",
      };
    }),
  });
}

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
  renderProductDetail(res, res.getViewData().breadcrumbs);

  next();
});

/**
 * Product-ShowInCategory: the same PDP, entered through a category.
 *
 * SFCC's SEO URL rules map category-scoped product paths here; nothing in the
 * storefront links to it, exactly as in base. Base renders the identical
 * template with the identical view data — minus the Page Designer lookup,
 * the canonical URL, and the schema data Product-Show adds — so the port is
 * the same page with the same props.
 *
 * The one thing base leaves on the table is the category itself: its
 * showProductPage helper always walks the product's *primary* category, so
 * the trail ignores the `cgid` the shopper arrived through and this route
 * renders breadcrumbs identical to Product-Show's. The helper it calls
 * already accepts a cgid, so this passes it and the trail finally names the
 * category in the URL, falling back to base's primary-category trail when the
 * cgid is absent or does not resolve.
 *
 * Variation values still carry Product-Show URLs (ProductDetailData rewrites
 * them), so selecting a variant leaves the category-scoped route — base's
 * jQuery PDP likewise replaced the address bar with Product-Show URLs.
 *
 * @queryParam pid required string the product ID to display
 * @queryParam cgid optional string the category the product is being viewed in
 * @queryParam quantity optional number selected quantity, carried on variation URLs
 */
server.append("ShowInCategory", initInertia.init, shareData, function (req, res, next) {
  var productHelpers = require("*/cartridge/scripts/helpers/productHelpers");

  var viewData = res.getViewData();
  var scoped = req.querystring.cgid
    ? productHelpers.getAllBreadcrumbs(req.querystring.cgid, null, []).reverse()
    : [];

  renderProductDetail(res, scoped.length ? scoped : viewData.breadcrumbs);

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
