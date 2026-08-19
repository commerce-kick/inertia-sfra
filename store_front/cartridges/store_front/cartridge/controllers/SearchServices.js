"use strict";

/**
 * @namespace SearchServices
 */

var server = require("server");
server.extend(module.superModule);

/**
 * SearchServices-GetSuggestions: the header typeahead.
 *
 * Base computes six suggestion models and renders them through
 * search/suggestions.isml. This appended step reuses that computation and
 * answers JSON instead — SFRA's appendRendering replaces the queued ISML
 * render with the json one, so the template never runs.
 *
 * Not an Inertia route: the header calls this with axios, so it keeps base's
 * cache middleware and never touches initInertia.
 *
 * @queryParam q required string the phrase the shopper is typing
 */
server.append("GetSuggestions", function (req, res, next) {
  var SearchSuggestionsData = require("*/cartridge/scripts/data/SearchSuggestionsData");

  // Base emits {} when the phrase is shorter than preferences.minTermLength or
  // no group had a hit; fromModels turns that into empty groups + total 0.
  res.json(SearchSuggestionsData.fromModels(res.getViewData().suggestions));

  next();
});

module.exports = server.exports();
