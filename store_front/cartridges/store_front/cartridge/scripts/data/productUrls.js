"use strict";

/**
 * SFRA's full product model builds variation-attribute URLs against
 * Product-Variation (models/product/fullProduct.js sets `endPoint: 'Variation'`),
 * the JSON endpoint its jQuery PDP swaps markup with. Inertia wants the real
 * Product-Show route instead: the same dwvar_* query params select the variant
 * server-side, so a partial visit re-renders the page with the chosen variant
 * and the selection stays in the URL — shareable, bookmarkable, and correct
 * under browser back.
 *
 * The pipeline name appears exactly once in the path segment, so a string
 * replace is safe. Same reasoning as searchUrls.normalizeSearchUrl.
 */

/**
 * Normalize an SFRA variation URL to the Product-Show route.
 * @param {string|dw.web.URL} url - URL from a base variation attribute value
 * @returns {string} the same URL targeting Product-Show
 */
function normalizeVariationUrl(url) {
  if (!url) return "";
  return url.toString().replace("Product-Variation", "Product-Show");
}

module.exports = { normalizeVariationUrl: normalizeVariationUrl };
