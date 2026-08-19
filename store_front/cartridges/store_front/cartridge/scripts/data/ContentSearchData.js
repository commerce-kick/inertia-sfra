"use strict";

var BaseData = require("../BaseData");
var ContentResultData = require("./ContentResultData");

/**
 * One page of content-search results — the Articles tab beside the products
 * on a search results page.
 *
 * Base rendered search/contentGrid.isml for a jQuery tab to inject; the same
 * ContentSearch model is typed here instead. Built via
 * ContentSearchData.fromModel — see the controller.
 */
var ContentSearchData = BaseData.extend({
  schema: {
    /** @type {string} the phrase that was searched for */
    queryPhrase: { type: "string", default: "" },
    /** @type {IContentResultData[]} this page of matched assets */
    contents: {
      type: "collection",
      of: ContentResultData,
      default: function () {
        return [];
      },
    },
    /** @type {number} total matches across every page */
    contentCount: { type: "number", default: 0 },
    /** @type {string} Search-Content URL for the next page, empty on the last */
    moreUrl: {
      transform: function (url) {
        return url ? url.toString() : "";
      },
      default: "",
    },
    /** @type {boolean} whether this is the first page, which is where the result-count line belongs */
    hasMessage: { type: "boolean", default: false },
  },
});

/**
 * Map a ContentSearch model to a plain ContentSearchData object.
 *
 * The model's own `hasMessage` compares a query-string value to a number
 * (`startingPage === 0`), so it is false on every request including the
 * first, and base's result-count line never rendered. Recomputed here.
 *
 * @param {Object} contentSearch - models/search/contentSearch instance
 * @param {string} startingPage - the startingPage query param, if any
 * @returns {Object} plain ContentSearchData object
 */
ContentSearchData.fromModel = function (contentSearch, startingPage) {
  return ContentSearchData.from({
    queryPhrase: contentSearch.queryPhrase,
    contents: contentSearch.contents,
    contentCount: contentSearch.contentCount,
    moreUrl: contentSearch.moreContentUrl,
    hasMessage: (parseInt(startingPage, 10) || 0) === 0,
  });
};

module.exports = ContentSearchData;
