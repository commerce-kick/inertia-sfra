"use strict";

var BaseData = require("../BaseData");

/**
 * The size-chart payload: the body markup of one content asset.
 *
 * Base answers `{ success: true, content }` when the asset resolves and a bare
 * `{}` when it does not, leaving the caller to read a missing key. Typed here,
 * the miss is `success: false` with empty content, so the client renders the
 * same branch for "no such asset" and "asset has no body".
 *
 * Built via SizeChartData.fromContent — see the controller.
 */
var SizeChartData = BaseData.extend({
  schema: {
    /** @type {boolean} whether the content asset resolved to body markup */
    success: { type: "boolean", default: false },
    /** @type {string} the asset's body markup, empty when it did not resolve */
    content: { type: "string", default: "" },
  },
});

/**
 * Map a content asset to a plain SizeChartData object.
 * @param {dw.content.Content} content - the asset ContentMgr resolved, or null
 * @returns {Object} plain SizeChartData object
 */
SizeChartData.fromContent = function (content) {
  var body = content && content.custom && content.custom.body;
  var markup = (body && body.markup) || "";

  return SizeChartData.from({
    success: Boolean(markup),
    content: markup,
  });
};

module.exports = SizeChartData;
