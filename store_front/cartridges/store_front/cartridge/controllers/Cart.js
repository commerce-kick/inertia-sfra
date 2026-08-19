"use strict";

/**
 * @namespace Cart
 */

const server = require("server");
server.extend(module.superModule);

var initInertia = require("*/cartridge/scripts/middleware/initInertia");
var shareData = require("*/cartridge/scripts/middleware/shareData");

/**
 * Answer a cart route with a typed payload, discarding whatever view data
 * the base route left behind.
 *
 * `res.json` *merges* into view data (modules/server/response.js), so an
 * appended JSON step would otherwise ship base's untyped model alongside the
 * typed one. Resetting first is the same move the adapter makes before it
 * emits a page, and it is what lets these routes append — keeping base's
 * transactions, validation and error handling — instead of replacing them.
 *
 * @param {Object} res - the SFRA response
 * @param {Object} payload - the DTO object to answer with
 * @returns {void}
 */
function answer(res, payload) {
  res.viewData = {};
  res.json(payload);
}

/**
 * Answer a cart mutation with the basket it produced — or, when base refused
 * the change, with the failure envelope the client already knows how to read.
 *
 * Base signals a refusal two ways at once: it sets a 500 and puts the reason
 * in `errorMessage`. A 500 rejects in the browser before anything reads the
 * body, so the shopper would be told "Request failed with status code 500"
 * instead of why. The status is normalized back to 200 and the reason travels
 * in the envelope `app/lib/queries/sfra.ts` unwraps for every SFRA endpoint —
 * so a hook still only ever sees a DTO or a rejection carrying real text.
 * `redirectUrl` is base's "your basket is gone, start over" signal.
 *
 * @param {Object} res - the SFRA response
 * @param {Object} [model] - the cart model, when base did not leave it at the
 *   top of view data (Cart-RemoveProductLineItem wraps it in `basket`)
 * @returns {void}
 */
function answerCart(res, model) {
  var BasketMgr = require("dw/order/BasketMgr");
  var CartData = require("*/cartridge/scripts/data/CartData");

  var viewData = res.getViewData();

  if (viewData.error || viewData.errorMessage) {
    res.setStatusCode(200);
    answer(res, {
      error: true,
      errorMessage: viewData.errorMessage || "",
      redirectUrl: viewData.redirectUrl || "",
    });
    return;
  }

  answer(res, CartData.fromModel(model || viewData, BasketMgr.getCurrentBasket()));
}

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

/**
 * Cart-AddProduct: put a product in the bag.
 *
 * Base does the whole job already — it resolves the product (single, set or
 * bundle), merges it with a matching line if the options agree, ensures every
 * shipment has a method, recalculates, and detects any choice-of-bonus
 * promotion the addition just earned. This appends and retypes the answer.
 *
 * The basket itself does not ride back: the cart page refreshes with a
 * partial reload of its own `cart` prop, and the header count is
 * Cart-MiniCart. What the caller cannot get any other way is the bonus offer,
 * which exists only in the difference between the basket before and after.
 *
 * Its fields are form fields, not query parameters, and are documented as
 * `@formParam` rather than `@queryParam`: SFRA's `req.form` is built by
 * getFormData, which skips any key that also appears in the query string
 * (modules/server/request.js), so a POST field put in the URL never arrives.
 * `@queryParam` would also make the generated route helper demand it in the
 * URL — the body is where it belongs.
 *
 * @formParam pid required string the product ID to add
 * @formParam quantity optional number how many, defaults to the product minimum
 * @formParam options optional string JSON array of {optionId, selectedValueId}
 * @formParam childProducts optional string JSON array of bundle children
 * @formParam pidsObj optional string JSON array of {pid, qty, options} for a product set
 */
server.append("AddProduct", function (req, res, next) {
  var CartActionData = require("*/cartridge/scripts/data/CartActionData");

  answer(res, CartActionData.fromResult(res.getViewData()));

  next();
});

/**
 * Cart-MiniCartShow: the contents of the bag flyout.
 *
 * Base rendered checkout/cart/miniCart.isml for jQuery to drop into the
 * popover the header fragment left empty. It does the same basket work
 * Cart-Show does first — revalidate the currency, ensure every shipment has
 * a method, recalculate — so this appends and answers the same CartData the
 * cart page renders, and the flyout is a narrower arrangement of the same
 * components rather than a second payload.
 */
server.append("MiniCartShow", function (req, res, next) {
  answerCart(res);

  next();
});

/**
 * Cart-Get: the basket as JSON.
 *
 * Base recalculates and answers the cart model; this appends and retypes it
 * as the same CartData every other cart surface reads.
 *
 * Nothing in the storefront calls it. The cart page receives the basket as an
 * Inertia prop and refreshes it with a partial reload, and the bag flyout has
 * its own route (Cart-MiniCartShow, which base also gave the currency
 * revalidation this one lacks) — so a hook here would be an export with no
 * caller. The route is typed rather than left untyped because it stays part
 * of the storefront's public surface either way.
 */
server.append("Get", function (req, res, next) {
  answerCart(res);

  next();
});

/**
 * Cart-UpdateQuantity: change how many of a line the shopper wants.
 *
 * Base owns the arithmetic — it checks the new quantity against inventory and
 * the rest of the basket (`checkPliCanBeUpdated`), recalculates, and adopts
 * any bonus discount the new quantity just earned — so this appends and
 * retypes.
 *
 * One base fault is left standing rather than repaired: base reads
 * `matchingLineItem.product` before checking that the line was found, so a
 * request naming a pid/uuid pair that is not in the basket throws instead of
 * answering its own "cannot update" message. Repairing it means replacing the
 * route and reimplementing the bonus-discount bookkeeping around it; nothing
 * in the storefront can produce that pair, since every uuid comes from the
 * basket the page was rendered from.
 *
 * @queryParam pid required string product ID of the line to change
 * @queryParam uuid required string UUID of the line to change
 * @queryParam quantity required number the new quantity
 */
server.append("UpdateQuantity", function (req, res, next) {
  answerCart(res);

  next();
});

/**
 * Cart-RemoveProductLineItem: take a line out of the bag.
 *
 * Base finds the line, collects the bonus lines that hung off it, removes it,
 * drops the shipment if that emptied a non-default one, and recalculates.
 * This appends and retypes.
 *
 * Base answered `{basket, toBeDeletedUUIDs}` — the second list told its
 * jQuery which bonus rows to delete from the DOM alongside the one the
 * shopper clicked. A re-render has no rows to reconcile, so only the basket
 * survives, and it arrives where every other cart route puts it.
 *
 * @queryParam pid required string product ID of the line to remove
 * @queryParam uuid required string UUID of the line to remove
 */
server.append("RemoveProductLineItem", function (req, res, next) {
  answerCart(res, res.getViewData().basket);

  next();
});

/**
 * Cart-EditProductLineItem: change which variant, how many, or which option a
 * line carries, without leaving the bag.
 *
 * Base does the work — it merges the line into an existing one when the new
 * product is already in the basket (summing the quantities and removing the
 * duplicate), replaces the product on the line unless it is a bundle, moves
 * the option value across, revalidates against inventory and recalculates.
 * This appends and retypes.
 *
 * Base answered `{cartModel, newProductId, uuidToBeDeleted, renderedTemplate}`
 * — a rendered product card for jQuery to swap in, plus the two ids it needed
 * to know which node to swap and which to delete. All three are DOM
 * bookkeeping; only the basket survives.
 *
 * @formParam uuid required string UUID of the line being edited
 * @formParam pid required string the product ID the line should carry
 * @formParam quantity required number the quantity the line should carry
 * @formParam selectedOptionValueId optional string chosen product-option value
 */
server.append("EditProductLineItem", function (req, res, next) {
  answerCart(res, res.getViewData().cartModel);

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
