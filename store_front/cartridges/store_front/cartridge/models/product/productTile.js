"use strict";

var decorators = require("*/cartridge/models/product/decorators/index");
var promotionCache = require("*/cartridge/scripts/util/promotionCache");

/**
 * Cartridge override of the base product tile model: the base requests only
 * the 'medium' image view type, but not every catalog defines it (this
 * sandbox's catalog ships 'large'/'small' only). Request the common sizes so
 * the Search controller can fall back across them.
 *
 * @param {Object} product - Product Model to be decorated
 * @param {dw.catalog.Product} apiProduct - Product information returned by the script API
 * @param {string} productType - Product type information
 * @returns {Object} - Decorated product model
 */
module.exports = function productTile(product, apiProduct, productType) {
  var productHelper = require("*/cartridge/scripts/helpers/productHelpers");
  var productSearchHit = productHelper.getProductSearchHit(apiProduct);
  decorators.base(product, apiProduct, productType);
  decorators.searchPrice(
    product,
    productSearchHit,
    promotionCache.promotions,
    productHelper.getProductSearchHit
  );
  decorators.images(product, apiProduct, {
    types: ["medium", "large", "small"],
    quantity: "single",
  });
  decorators.ratings(product);
  if (productType === "set") {
    decorators.setProductsCollection(product, apiProduct);
  }

  decorators.searchVariationAttributes(product, productSearchHit);

  return product;
};
