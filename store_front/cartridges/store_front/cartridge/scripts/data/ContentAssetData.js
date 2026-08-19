"use strict";

var BaseData = require("../BaseData");

/**
 * A content asset: a page whose body is markup authored in Business
 * Manager — the About, the shipping policy, the size guides.
 *
 * The body arrives as HTML because that is what it is. There is no version of
 * this that comes down as structured data: a merchant wrote markup into a
 * rich-text field, and the page renders it. `SizeChartData` (1.7) is the same
 * bargain at fragment size, and the storefront gives both the same
 * `cms-body` voice so authored markup cannot drift out of the design.
 */
var ContentAssetData = BaseData.extend({
  schema: {
    /** @type {string} the asset's ID, which is also what addresses it */
    id: { type: "string", default: "" },
    /** @type {string} the asset's name */
    name: { type: "string", default: "" },
    /** @type {string} the title for the browser tab, falling back to the name */
    pageTitle: { type: "string", default: "" },
    /** @type {string} the authored body markup, empty when the asset has none */
    body: { type: "string", default: "" },
  },
});

/**
 * Map base's content model to a plain ContentAssetData object.
 * @param {Object} model - SFRA content model
 * @returns {Object} plain ContentAssetData object
 */
ContentAssetData.fromModel = function (model) {
  var body = model && model.body;

  return ContentAssetData.from({
    id: model && model.ID,
    name: model && model.name,
    pageTitle: (model && model.pageTitle) || (model && model.name),
    // The body is a MarkupText, whose `markup` is the string; a plain string
    // survives the same read.
    body: (body && body.markup) || (typeof body === "string" ? body : ""),
  });
};

module.exports = ContentAssetData;
