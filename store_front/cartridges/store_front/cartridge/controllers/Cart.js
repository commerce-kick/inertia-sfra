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

/**
 * Cart-MiniCart: the bag count in the header.
 *
 * Base rendered components/header/miniCart.isml — the bag glyph, the count,
 * and an empty popover the flyout would later be injected into — and the
 * page header pulled it in as a remote include, which is why base guarded
 * the route with `server.middleware.include`. A typed client has no use for
 * that markup, so this replaces the route with the number the fragment
 * existed to print; replacing also drops the include guard, which is what
 * makes the route directly callable.
 *
 * The count is deliberately not a shared Inertia prop: it would then be
 * recomputed on every page of the storefront, and it changes only when the
 * shopper touches the bag.
 */
server.replace("MiniCart", function (req, res, next) {
  var BasketMgr = require("dw/order/BasketMgr");
  var MiniCartData = require("*/cartridge/scripts/data/MiniCartData");

  var currentBasket = BasketMgr.getCurrentBasket();

  res.json(
    MiniCartData.from({
      quantity: currentBasket ? currentBasket.productQuantityTotal : 0,
    })
  );

  next();
});

module.exports = server.exports();
