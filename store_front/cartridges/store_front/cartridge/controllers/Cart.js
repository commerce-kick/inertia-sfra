"use strict";

/**
 * @namespace Cart
 */

const server = require("server");
server.extend(module.superModule);

var initInertia = require("*/cartridge/scripts/middleware/initInertia");
var shareData = require("*/cartridge/scripts/middleware/shareData");

/**
 * Cart-Show: the bag.
 *
 * Base computes the whole cart model — it revalidates the currency, makes
 * sure every shipment has a method, recalculates the totals, and renders
 * cart/cart.isml with the model as view data. All of that is worth keeping,
 * so this appends and swaps only the render: the same model, typed by
 * CartData, becomes the page's single prop.
 *
 * The prop is named `cart` because every cart mutation refreshes it with
 * `router.reload({ only: ["cart"] })` — one name, one round trip, whichever
 * control the shopper touched.
 *
 * Base's `reportingURLs` (the analytics beacons it renders into the page) are
 * not carried over; they are their own row.
 */
server.append("Show", initInertia.init, shareData, function (req, res, next) {
  var BasketMgr = require("dw/order/BasketMgr");
  var CartData = require("*/cartridge/scripts/data/CartData");

  var viewData = res.getViewData();

  res.inertia.render("Cart/Show", {
    cart: CartData.fromModel(viewData, BasketMgr.getCurrentBasket()),
  });

  next();
});

server.append("MiniCartShow", function (req, res, next) {
  const viewData = res.getViewData();

  res.setViewData({
    checkoutUrl: dw.web.URLUtils.url("Checkout-Begin").toString(),
  });

  res.json(viewData);

  next();
});

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
