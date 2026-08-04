"use strict";

/**
 * SFRA base models emit refinement URLs against Search-ShowAjax and sort
 * URLs against Search-UpdateGrid (ISML grid-swap endpoints). Inertia visits
 * need the full Search-Show route instead. Pipeline names appear exactly
 * once in the path segment, so a string replace is safe.
 */

/**
 * Normalize an SFRA search grid URL to the Search-Show route.
 * @param {string|dw.web.URL} url - URL from a base search model
 * @returns {string} the same URL targeting Search-Show
 */
function normalizeSearchUrl(url) {
  if (!url) return "";
  return url
    .toString()
    .replace("Search-ShowAjax", "Search-Show")
    .replace("Search-UpdateGrid", "Search-Show");
}

module.exports = { normalizeSearchUrl: normalizeSearchUrl };
