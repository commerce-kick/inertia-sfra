"use strict";

var BaseData = require("../BaseData");
var SuggestionLinkData = require("./SuggestionLinkData");
var SuggestionPhraseData = require("./SuggestionPhraseData");

/**
 * The typeahead payload. Base SearchServices-GetSuggestions computes six
 * suggestion models and renders them through search/suggestions.isml; this
 * flattens the same six into one typed shape, in the order the template
 * showed them:
 *
 *   didYouMean  spelling fixes for what was typed
 *   products    suggested products
 *   categories  suggested categories, `detail` naming the parent
 *   recent      this shopper's recent searches
 *   popular     popular searches on this site
 *   brands      brand suggestions
 *   contents    suggested content pages
 *
 * Built via SearchSuggestionsData.fromModels — see the controller.
 */
var SearchSuggestionsData = BaseData.extend({
  schema: {
    didYouMean: { type: "collection", of: SuggestionPhraseData, default: function () { return []; } },
    products: { type: "collection", of: SuggestionLinkData, default: function () { return []; } },
    categories: { type: "collection", of: SuggestionLinkData, default: function () { return []; } },
    contents: { type: "collection", of: SuggestionLinkData, default: function () { return []; } },
    recent: { type: "collection", of: SuggestionPhraseData, default: function () { return []; } },
    popular: { type: "collection", of: SuggestionPhraseData, default: function () { return []; } },
    brands: { type: "collection", of: SuggestionPhraseData, default: function () { return []; } },
    /** @type {number} total suggestions across every group */
    total: { type: "number", default: 0 },
  },
});

/**
 * Map a phrase list from a SearchPhraseSuggestions model.
 * @param {Object} model - a base SearchPhraseSuggestions model
 * @returns {Array<Object>} plain phrase objects
 */
function phrases(model) {
  return model && model.available ? SuggestionPhraseData.collect(model.phrases) : [];
}

/**
 * The base product-suggestion model returns spelling variants as
 * {exactMatch, value} with no URL — the template built the Search-Show link
 * inline. Exact matches are what the shopper already typed, so only the
 * corrections are worth showing.
 * @param {Object} productModel - a base ProductSuggestions model
 * @returns {Array<Object>} plain phrase objects
 */
function didYouMean(productModel) {
  var URLUtils = require("dw/web/URLUtils");
  var list = (productModel && productModel.phrases) || [];

  return list
    .filter(function (phrase) {
      return phrase && !phrase.exactMatch;
    })
    .map(function (phrase) {
      return SuggestionPhraseData.from({
        value: phrase.value,
        url: URLUtils.url("Search-Show", "q", phrase.value).toString(),
      });
    });
}

/**
 * Flatten the six suggestion models the base controller puts on viewData.
 * @param {Object} suggestions - viewData.suggestions from the base route
 * @returns {Object} plain SearchSuggestionsData object
 */
SearchSuggestionsData.fromModels = function (suggestions) {
  var models = suggestions || {};
  var productModel = models.product;
  var categoryModel = models.category;
  var contentModel = models.content;

  var data = {
    didYouMean: didYouMean(productModel),
    products:
      productModel && productModel.available
        ? SuggestionLinkData.collect(productModel.products)
        : [],
    categories:
      categoryModel && categoryModel.available
        ? (categoryModel.categories || []).map(function (category) {
            return SuggestionLinkData.from({
              name: category.name,
              url: category.url,
              imageUrl: category.imageUrl,
              // Base only showed the parent for non-root categories.
              detail: category.parentID !== "root" ? category.parentName : "",
            });
          })
        : [],
    contents:
      contentModel && contentModel.available
        ? SuggestionLinkData.collect(contentModel.contents)
        : [],
    recent: phrases(models.recent),
    popular: phrases(models.popular),
    brands: phrases(models.brand),
  };

  data.total = [
    data.didYouMean,
    data.products,
    data.categories,
    data.contents,
    data.recent,
    data.popular,
    data.brands,
  ].reduce(function (sum, group) {
    return sum + group.length;
  }, 0);

  return SearchSuggestionsData.from(data);
};

module.exports = SearchSuggestionsData;
