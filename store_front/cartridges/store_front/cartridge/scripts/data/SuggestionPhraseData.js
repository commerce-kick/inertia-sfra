"use strict";

var BaseData = require("../BaseData");

/** One suggested search phrase — recent, popular, brand, or a spelling fix. */
var SuggestionPhraseData = BaseData.extend({
  schema: {
    /** @type {string} the phrase itself */
    value: { type: "string", default: "" },
    /** @type {string} Search-Show URL running this phrase */
    url: {
      transform: function (url) {
        return url ? url.toString() : "";
      },
      default: "",
    },
  },
});

module.exports = SuggestionPhraseData;
