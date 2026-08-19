"use strict";

/**
 * @namespace Cart
 */

const server = require("server");
server.extend(module.superModule);

var initInertia = require("*/cartridge/scripts/middleware/initInertia");
var shareData = require("*/cartridge/scripts/middleware/shareData");

// The reset-then-json seam every appended JSON route shares, and the failure
// envelope beside it; the account routes are their second caller, so both
// live in scripts/helpers now.
var answerJson = require("*/cartridge/scripts/helpers/answerJson");
var answer = answerJson.answerJson;
var answerError = answerJson.answerError;

/**
 * Answer a cart mutation with the basket it produced — or, when base refused
 * the change, with the failure envelope the client already knows how to read.
 *
 * Base signals a refusal two ways at once: it sets a 500 and puts the reason
 * in `errorMessage`. A 500 rejects in the browser before anything reads the
 * body, so the shopper would be told "Request failed with status code 500"
 * instead of why — which is what answerError normalizes. `redirectUrl` is
 * base's "your basket is gone, start over" signal.
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
    answerError(res, viewData.errorMessage, viewData.redirectUrl);
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
 * Cart-AddCoupon: redeem a promo code.
 *
 * Base creates the coupon line item, maps every platform error code to a
 * message ("already in the cart", "already redeemed", "cannot be combined"),
 * recalculates and answers the basket. This appends and retypes.
 *
 * The route is a GET that base guarded with `csrfProtection.validateAjaxRequest`,
 * so its token travels in the query string rather than a body — see
 * `useCsrfParams` in app/lib/queries/sfra.ts. The token is not documented as a
 * `@queryParam` for the same reason the POST routes do not document theirs:
 * it is transport, not a parameter of the route, and typing it into the
 * generated helper would make every caller name it.
 *
 * @queryParam couponCode required string the code the shopper entered
 */
server.append("AddCoupon", function (req, res, next) {
  answerCart(res);

  next();
});

/**
 * Cart-RemoveCouponLineItem: give a promo code back.
 *
 * Base finds the coupon line item by UUID, removes it, recalculates and
 * answers the basket. This appends and retypes.
 *
 * Base's `code` parameter is only there for its jQuery, which read it back
 * out of the request to name the coupon in a confirmation; the UUID is what
 * identifies the line. It is documented because base still accepts it.
 *
 * @queryParam uuid required string UUID of the coupon line item to remove
 * @queryParam code optional string the coupon code, unused by the route itself
 */
server.append("RemoveCouponLineItem", function (req, res, next) {
  answerCart(res);

  next();
});

/**
 * Cart-AddBonusProducts: commit a choice-of-bonus selection.
 *
 * Base validates the total against what the promotion allows, clears whatever
 * was chosen before, creates a bonus product line item per pick at its chosen
 * quantity, and stamps the qualifying line so the cart can find them again.
 * This appends and retypes its answer as the same CartActionData a plain
 * add-to-bag returns.
 *
 * Base reads all three fields off `req.querystring` even though it declares
 * the route a POST, so they are query parameters despite the method — unlike
 * Cart-AddProduct, whose fields are read off `req.form`.
 *
 * Left standing: base looks the discount up by UUID and calls
 * `getBonusProductLineItems()` on the result without checking it was found,
 * so an unknown uuid throws rather than answering. Every uuid the storefront
 * sends came from the basket it was rendered from, or from the offer this
 * route's own add-to-bag answer handed back.
 *
 * @queryParam pids required string JSON {totalQty, bonusProducts: [{pid, qty, options}]}
 * @queryParam uuid required string UUID of the bonus discount line item being chosen against
 * @queryParam pliuuid required string UUID of the line item that earned the offer
 */
server.append("AddBonusProducts", function (req, res, next) {
  var CartActionData = require("*/cartridge/scripts/data/CartActionData");

  answer(res, CartActionData.fromResult(res.getViewData()));

  next();
});

/**
 * Cart-EditBonusProduct: reopen a choice-of-bonus offer already in the bag.
 *
 * It answers the same offer Cart-AddProduct hands back when the addition
 * earns one — base even names the fields identically — so it retypes to the
 * same BonusOfferData and opens the same chooser.
 *
 * Base also returned `selectedBonusProducts`, a page size, an add-to-cart
 * URL, a label bag and an always-empty `selectprods`. The chooser reads what
 * was already picked from Product-ShowBonusProducts' own `selected` (row
 * 1.9), the page size is baked into the chooser URL the server builds, and
 * the add-to-cart URL comes from the generated route helper.
 *
 * Left standing: base reads `getBonusDiscountLineItems()` off the basket and
 * `bonusProductLineItems` off the result without checking either, so no
 * basket or an unknown duuid throws. Every duuid comes from a line of the
 * basket the page was rendered from.
 *
 * @queryParam duuid required string UUID of the bonus discount line item
 */
server.append("EditBonusProduct", function (req, res, next) {
  var BonusOfferData = require("*/cartridge/scripts/data/BonusOfferData");

  answer(res, BonusOfferData.fromResult(res.getViewData()));

  next();
});

/**
 * Cart-SelectShippingMethod: choose how the bag should be delivered.
 *
 * Base assigns the method to the shipment, recalculates, and answers the
 * basket — with the shipping cost and tax that were "-" until a method
 * existed now resolved. This appends and retypes.
 *
 * Base accepts both fields from the query string or the form and prefers the
 * query string; they go in the body, which is what a POST is for. The
 * shipment is left unnamed on purpose: base falls back to the default
 * shipment, and the cart is single-shipment (it is checkout that splits a
 * basket across shipments).
 *
 * @formParam methodID required string ID of the shipping method to assign
 * @formParam shipmentUUID optional string UUID of the shipment, defaulting to the basket's default
 */
server.append("SelectShippingMethod", function (req, res, next) {
  answerCart(res);

  next();
});

/**
 * Cart-GetProduct: the product behind a cart line, for the edit dialog.
 *
 * This one is replaced rather than appended. Base defers its answer to a
 * `route:BeforeComplete` handler that renders product/quickView.isml out of
 * view data — so it runs *after* an appended step and would render from the
 * view data that step reset. Replacing removes the handler with the route.
 *
 * The product is resolved exactly as base resolved it: by the line's product
 * ID, at the line's quantity, with the line's chosen option applied, so the
 * dialog opens on what the shopper actually has.
 *
 * Two repairs: base reads `allProductLineItems` off the basket and
 * `quantityValue` off the found line without checking either, so an expired
 * basket or a stale uuid throws instead of answering — both now come back as
 * the error envelope. And base sent the option down twice (once as
 * `selectedOptionValueId`, once inside a `selectedOptions` array it then
 * dropped into the template); one field carries it.
 *
 * @queryParam uuid required string UUID of the product line item to edit
 */
server.replace("GetProduct", function (req, res, next) {
  var BasketMgr = require("dw/order/BasketMgr");
  var collections = require("*/cartridge/scripts/util/collections");
  var ProductFactory = require("*/cartridge/scripts/factories/product");
  var CartEditProductData = require("*/cartridge/scripts/data/CartEditProductData");

  var basket = BasketMgr.getCurrentBasket();
  var lineItem = basket
    ? collections.find(basket.allProductLineItems, function (item) {
        return item.UUID === req.querystring.uuid;
      })
    : null;

  if (!lineItem) {
    res.json(
      CartEditProductData.from({
        error: true,
        errorMessage: "That item is no longer in your bag.",
      })
    );
    return next();
  }

  var optionItems = lineItem.optionProductLineItems;
  var option =
    optionItems && optionItems.length ? optionItems.iterator().next() : null;

  res.json(
    CartEditProductData.from({
      uuid: lineItem.UUID,
      product: ProductFactory.get({
        pid: lineItem.productID,
        quantity: lineItem.quantityValue,
        options: option
          ? [
              {
                optionId: option.optionID,
                selectedValueId: option.optionValueID,
                productId: lineItem.productID,
              },
            ]
          : null,
      }),
      selectedQuantity: lineItem.quantityValue,
      selectedOptionValueId: option ? option.optionValueID : "",
    })
  );

  return next();
});

/**
 * Cart-AddProductListItem: put an item from a product list — a wishlist or a
 * gift registry — into the bag. Contributed by plugin_giftregistry.
 *
 * Base resolves the list item, checks the quantity against what is already in
 * the basket, adds it and detects any choice-of-bonus promotion it earned, so
 * this appends and retypes its answer as the same CartActionData a plain
 * add-to-bag returns — down to the bonus offer, which opens the same chooser.
 *
 * No hook yet: nothing renders a product list until the wishlist and gift
 * registry waves, and the caller belongs with the surface that has a list
 * item to add. The route is typed now because it is part of the storefront's
 * public surface either way.
 *
 * @formParam plid required string ID of the product list
 * @formParam pid required string ID of the item within the list
 * @formParam qty optional number how many, defaulting to 1
 */
server.append("AddProductListItem", function (req, res, next) {
  var CartActionData = require("*/cartridge/scripts/data/CartActionData");

  answer(res, CartActionData.fromResult(res.getViewData()));

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
