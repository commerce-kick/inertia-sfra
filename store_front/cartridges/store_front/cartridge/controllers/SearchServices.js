"use strict";

/**
 * @namespace SearchServices
 */

var server = require("server");
server.extend(module.superModule);

var utils = require("*/cartridge/helpers/utils");

/**
 * SearchServices-GetSuggestions : The SearchServices-GetSuggestions endpoint is responsible for searching as you type and displaying the suggestions from that search
 * @name Base/SearchServices-GetSuggestions
 * @function
 * @memberof SearchServices
 * @param {middleware} - cache.applyDefaultCache
 * @param {querystringparameter} - q - the query string a shopper is searching for
 * @param {category} - non-sensitive
 * @param {returns} - json
 * @param {serverfunction} - get
 */
server.append("GetSuggestions", function (req, res, next) {
  const viewData = res.getViewData();
  /* ("[JavaClass dw.web.URL]"); */
  const r = utils.processUrls(viewData.suggestions);

  res.json({
    suggestions: r,
  });

  next();
});

module.exports = server.exports();
