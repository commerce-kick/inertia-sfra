function inertiaSharedData(req, res, next) {
  var URLUtils = require("dw/web/URLUtils");

  res.setViewData({
    currentCustomer: req.currentCustomer,
    staticUrl: URLUtils.staticURL("/").toString(),
  });

  next();
}

module.exports = {
  inertiaSharedData: inertiaSharedData,
};
