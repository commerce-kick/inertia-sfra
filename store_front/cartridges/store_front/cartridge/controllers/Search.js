"use strict";

/**
 * @namespace Search
 */

const server = require("server");
server.extend(module.superModule);

var initInertia = require("*/cartridge/scripts/middleware/initInertia");
var shareData = require("*/cartridge/scripts/middleware/shareData");
var cache = require("*/cartridge/scripts/middleware/cache");

/**
 * Search-Show: the PLP. Base SFRA Search-Show runs first and computes
 * productSearch in viewData; this appended step replaces the ISML render
 * with the Inertia page. Refinement/sort/search props are closures so
 * InfiniteScroll partial reloads (only: ['products']) never pay for their
 * serialization.
 *
 * @queryParam cgid optional string category ID for category landing PLPs
 * @queryParam q optional string free-text search phrase
 * @queryParam srule optional string sorting rule ID
 * @queryParam start optional number zero-based offset of the first tile
 * @queryParam sz optional number page size (default 12)
 * @queryParam prefn1 optional string first refinement attribute name (prefn2..n continue)
 * @queryParam prefv1 optional string first refinement attribute value (prefv2..n continue)
 * @queryParam pmin optional number minimum price filter
 * @queryParam pmax optional number maximum price filter
 */
server.append("Show", initInertia.init, shareData, function (req, res, next) {
  var SearchTileData = require("*/cartridge/scripts/data/SearchTileData");
  var RefinementData = require("*/cartridge/scripts/data/RefinementData");
  var SelectedFilterData = require("*/cartridge/scripts/data/SelectedFilterData");
  var SortOptionData = require("*/cartridge/scripts/data/SortOptionData");
  var CategoryData = require("*/cartridge/scripts/data/CategoryData");
  var searchUrls = require("*/cartridge/scripts/data/searchUrls");

  var viewData = res.getViewData();
  var productSearch = viewData.productSearch;

  var products = res.inertia.scroll(function () {
    var ProductFactory = require("*/cartridge/scripts/factories/product");

    var tiles = productSearch.productIds.map(function (product) {
      return SearchTileData.fromTile(
        ProductFactory.get({ pid: product.productID, pview: "tile" })
      );
    });

    return res.inertia.createPaginator(tiles, productSearch.count);
  });

  res.inertia.render("Search/Show", {
    products: products,

    search: function () {
      return {
        count: productSearch.count,
        keywords: productSearch.searchKeywords || "",
        isCategorySearch: Boolean(productSearch.isCategorySearch),
        resetLink: searchUrls.normalizeSearchUrl(productSearch.resetLink),
        permalink: searchUrls.normalizeSearchUrl(productSearch.permalink),
        category: CategoryData.optional(productSearch.category),
        bannerImageUrl: productSearch.bannerImageUrl
          ? productSearch.bannerImageUrl.toString()
          : "",
      };
    },

    refinements: function () {
      return RefinementData.collect(productSearch.refinements);
    },

    selectedFilters: function () {
      return SelectedFilterData.collect(productSearch.selectedFilters);
    },

    sort: function () {
      var productSort = productSearch.productSort;
      return {
        ruleId: (productSort && productSort.ruleId) || "",
        options: SortOptionData.collect(productSort && productSort.options),
      };
    },
  });

  next();
});

/**
 * Search-Content: the Articles tab beside the products on a results page.
 *
 * Base rendered search/contentGrid.isml to an HTML string for a jQuery tab to
 * inject and paged it with a "More Results" button; this replaces the route
 * with the same ContentSearch model typed, so the tab is React and the paging
 * follows the server-authored `moreUrl` out of the payload.
 *
 * Replacing rather than appending because `res.json` *merges* into whatever
 * view data is already there: base's own render would ship the raw
 * ContentSearch model alongside the typed one. For the same reason base's
 * `consentTracking.consent` is not carried over — it writes `tracking_consent`
 * (and a CSRF pair) into view data, which on a JSON route means onto the wire.
 * Consent is already established by Search-Show, which hosts this tab.
 * The default cache base applied is kept.
 *
 * @queryParam q required string the phrase to search content for
 * @queryParam startingPage optional number index of the first result on this page
 */
server.replace("Content", cache.applyDefaultCache, function (req, res, next) {
  var searchHelpers = require("*/cartridge/scripts/helpers/searchHelpers");
  var ContentSearchData = require("*/cartridge/scripts/data/ContentSearchData");

  res.json(
    ContentSearchData.fromModel(
      searchHelpers.setupContentSearch(req.querystring),
      req.querystring.startingPage
    )
  );

  next();
});

module.exports = server.exports();
