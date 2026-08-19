"use strict";

/**
 * @namespace Page
 */

const server = require("server");
server.extend(module.superModule);

var initInertia = require("*/cartridge/scripts/middleware/initInertia");
var shareData = require("*/cartridge/scripts/middleware/shareData");

/**
 * Page-Show: a content asset as a page.
 *
 * Ported because two surfaces already link here and could not: the Articles
 * tab of a keyword search (1.10) and the content suggestions in the header
 * typeahead (1.4) both emit `Page-Show` URLs — base's own
 * `contentSearch.ACTION_ENDPOINT_CONTENT` — so following one was an Inertia
 * visit to an ISML route, which answers markup the client cannot read.
 *
 * Base serves two different things from this route and only one of them is a
 * content asset: when `cid` names a *Page Designer* page it renders that
 * page instead (`res.page(...)`), which is a rendering model of its own and
 * has no Inertia equivalent yet. That render is left standing — this step
 * only takes over when base put a content model in view data.
 *
 * The offline and not-found branches are base's too, and equally untouched:
 * both render its `offlineContent` template, and neither leaves a content
 * model behind.
 *
 * @queryParam cid required string the content asset ID
 */
server.append("Show", initInertia.init, shareData, function (req, res, next) {
  var ContentAssetData = require("*/cartridge/scripts/data/ContentAssetData");

  var viewData = res.getViewData();

  if (!viewData.content) return next();

  res.inertia.render("Page/Show", {
    content: ContentAssetData.fromModel(viewData.content),
  });

  return next();
});

module.exports = server.exports();
