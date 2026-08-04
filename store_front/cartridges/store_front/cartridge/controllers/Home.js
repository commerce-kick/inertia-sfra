"use strict";

/**
 * @namespace Home
 */

const server = require("server");
server.extend(module.superModule);

var initInertia = require("*/cartridge/scripts/middleware/initInertia");
var shareData = require("*/cartridge/scripts/middleware/shareData");

/** How many tiles a Home showcase row carries. */
var SHOWCASE_ROW_SIZE = 8;
/** How many top-level categories get a showcase row. */
var SHOWCASE_ROW_COUNT = 3;

/**
 * Home-Show: the storefront home page. Replaces the base ISML/Page Designer
 * render entirely; hero and editorial content are frontend-authored, the
 * commerce data (category showcase + product rows) comes from the live
 * catalog. Product rows ride in one deferred group ("showcase") so the
 * first paint ships without them and a single follow-up XHR fills all rows.
 */
server.replace("Show", initInertia.init, shareData, function (req, res, next) {
  var CatalogMgr = require("dw/catalog/CatalogMgr");
  var URLUtils = require("dw/web/URLUtils");
  var inertia = res.inertia;

  /**
   * Top-level online categories with a storefront image when one is set.
   * @returns {Array<Object>} category showcase entries
   */
  function categoryShowcase() {
    var root = CatalogMgr.getSiteCatalog().getRoot();
    var showcase = [];

    if (!root.hasOnlineSubCategories()) return showcase;

    var iterator = root.getOnlineSubCategories().iterator();
    while (iterator.hasNext()) {
      var category = iterator.next();
      var image = category.image || category.thumbnail;
      showcase.push({
        id: category.ID,
        name: category.displayName,
        url: URLUtils.url("Search-Show", "cgid", category.ID).toString(),
        image: image ? { url: image.getURL().toString(), alt: category.displayName } : null,
      });
    }

    return showcase;
  }

  /**
   * One product row per top-level category, tiles shaped like PLP rows.
   * @returns {Array<Object>} showcase rows
   */
  function showcaseRows() {
    var ProductSearchModel = require("dw/catalog/ProductSearchModel");
    var ProductFactory = require("*/cartridge/scripts/factories/product");
    var SearchTileData = require("*/cartridge/scripts/data/SearchTileData");

    return categoryShowcase()
      .slice(0, SHOWCASE_ROW_COUNT)
      .map(function (category) {
        var psm = new ProductSearchModel();
        psm.setCategoryID(category.id);
        psm.setRecursiveCategorySearch(true);
        psm.search();

        var products = [];
        var hits = psm.getProductSearchHits();
        while (hits.hasNext() && products.length < SHOWCASE_ROW_SIZE) {
          var hit = hits.next();
          products.push(
            SearchTileData.fromTile(
              ProductFactory.get({ pid: hit.productID, pview: "tile" })
            )
          );
        }

        return {
          categoryId: category.id,
          title: category.name,
          url: category.url,
          products: products,
        };
      })
      .filter(function (row) {
        return row.products.length > 0;
      });
  }

  inertia.render("Home/Show", {
    categoryShowcase: categoryShowcase,
    showcases: inertia.defer(showcaseRows, "showcase"),
  });

  next();
});

module.exports = server.exports();
