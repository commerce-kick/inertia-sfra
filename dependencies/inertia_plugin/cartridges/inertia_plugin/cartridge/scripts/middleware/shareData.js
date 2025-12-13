function sharedData(req, res, next) {
  var catalogMgr = require("dw/catalog/CatalogMgr");
  var URLUtils = require("dw/web/URLUtils");
  var Categories = require("*/cartridge/models/categories");
  var siteRootCategory = catalogMgr.getSiteCatalog().getRoot();

  var topLevelCategories = siteRootCategory.hasOnlineSubCategories()
    ? siteRootCategory.getOnlineSubCategories()
    : null;

  const viewData = res.getViewData();

  const globalData = {
    currentCustomer: req.currentCustomer,
    staticUrl: URLUtils.staticURL("/").toString(),
    navBar: new Categories(topLevelCategories),
    locale: viewData.locale,
  };

  res.setViewData({sharedData: globalData});

  next();
}

module.exports = sharedData;
