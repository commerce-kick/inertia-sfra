'use strict';

/**
 * Sets the relevant product search model properties, depending on the parameters provided
 *
 * @param {dw.catalog.ProductSearchModel} productSearch - Product search object
 * @param {Object} httpParams - Query params
 * @param {dw.catalog.Category} selectedCategory - Selected category
 * @param {dw.catalog.SortingRule} sortingRule - Product grid sort rule
 * @param {dw.web.HttpParameterMap} httpParameterMap - api parameter map
 * @property {dw.web.HttpParameter} [httpParameterMap.pmin] -  min price param
 * @property {dw.web.HttpParameter} [httpParameterMap.pmax] -  max price param
 * @property {boolean} [httpParameterMap.pmin.submitted] - is min price param submitted
 * @property {boolean} [httpParameterMap.pmax.submitted] - is max price param submitted
 * @property {Double} [httpParameterMap.pmin.doubleValue] - Minimum Price
 * @property {Double} [httpParameterMap.pmax.doubleValue] - Maximum Price
 */
function setProductProperties(productSearch, httpParams, selectedCategory, sortingRule, httpParameterMap) {
    var searchPhrase;

    if (httpParams.q) {
        searchPhrase = httpParams.q;
        productSearch.setSearchPhrase(searchPhrase);
    }
    if (selectedCategory) {
        productSearch.setCategoryID(selectedCategory.ID);
    }
    if (httpParams.pid) {
        productSearch.setProductIDs([httpParams.pid]);
    }
    if (httpParameterMap) {
        if (httpParameterMap.pmin && httpParameterMap.pmin.submitted) {
            productSearch.setPriceMin(httpParameterMap.pmin.doubleValue);
        }
        if (httpParameterMap.pmax && httpParameterMap.pmin.submitted) {
            productSearch.setPriceMax(httpParameterMap.pmax.doubleValue);
        }
    }
    if (httpParams.pmid) {
        productSearch.setPromotionID(httpParams.pmid);
    }

    if (sortingRule) {
        productSearch.setSortingRule(sortingRule);
    }

    productSearch.setRecursiveCategorySearch(true);
}

/**
 * Updates the search model with the preference refinement values
 *
 * @param {dw.catalog.SearchModel} search - SearchModel instance
 * @param {Object} preferences - Query params map
 */
function addRefinementValues(search, preferences) {
    Object.keys(preferences).forEach(function (key) {
        search.addRefinementValues(key, preferences[key]);
    });
}

module.exports = {
    addRefinementValues: addRefinementValues,
    setProductProperties: setProductProperties
};
