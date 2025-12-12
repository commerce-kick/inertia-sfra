"use strict";

/**
 * @namespace Product
 */

const server = require("server");
server.extend(module.superModule);

const inertia = require("*/cartridge/scripts/middleware/inertiaMiddleware");

server.append("MiniCartShow", function (req, res, next) {
  const viewData = res.getViewData();

  res.setViewData({
    checkoutUrl: dw.web.URLUtils.url("Checkout-Begin").toString(),
  });

  res.json(viewData);

  next();
});

server.append(
  "Show",
  function (req, res, next) {
    const viewData = res.getViewData();

    res.setViewData({
      template: "Cart/Show",
      props: viewData,
    });

    next();
  },
  inertia.shareData,
  inertia.render
);

server.replace("MiniCart", function (req, res, next) {
  var BasketMgr = require("dw/order/BasketMgr");

  var currentBasket = BasketMgr.getCurrentBasket();
  var quantityTotal;

  if (currentBasket) {
    quantityTotal = currentBasket.productQuantityTotal;
  } else {
    quantityTotal = 0;
  }

  res.json({
    quantity: quantityTotal,
  });

  next();
});

module.exports = server.exports();
