function inertiaSharedData(req, res, next) {
  var catalogMgr = require("dw/catalog/CatalogMgr");
  var Categories = require("*/cartridge/models/categories");
  var siteRootCategory = catalogMgr.getSiteCatalog().getRoot();

  var topLevelCategories = siteRootCategory.hasOnlineSubCategories()
    ? siteRootCategory.getOnlineSubCategories()
    : null;

  var URLUtils = require("dw/web/URLUtils");

  const viewData = res.getViewData();

  res.setViewData({
    sharedData: {
      currentCustomer: req.currentCustomer,
      staticUrl: URLUtils.staticURL("/").toString(),
      navBar: new Categories(topLevelCategories),
      locale: viewData.locale
    },
  });

  next();
}

module.exports = {
  inertiaSharedData: inertiaSharedData,
};
