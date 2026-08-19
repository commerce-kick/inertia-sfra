"use strict";

var BaseData = require("../BaseData");
var PriceData = require("./PriceData");
var CartBonusLineItemData = require("./CartBonusLineItemData");
var lineItemFields = require("./lineItemFields");

/**
 * One line of the basket — base's cart/productCard/cartProductCard.isml and
 * its two siblings (the bundle card and the uncategorized card) collapsed
 * into a single shape the React card branches on.
 *
 * `noProduct` is the uncategorized branch: a line whose product left the
 * online catalog, which base renders as an image and an apology with no
 * price and no controls. `productType === "bundle"` is the bundle branch,
 * where `bundledItems` names what the bundle includes. Everything else is the
 * ordinary card.
 *
 * Base emitted an `actionUrls` bag on the cart model for its jQuery handlers;
 * nothing here carries a URL that the generated route helpers can build from
 * the line's own UUID. `bonusOffers` is the exception — the chooser URL is
 * assembled from a bonus discount line item the client never sees.
 */
var CartLineItemData = BaseData.extend({
  schema: {
    /** @type {string} UUID of the product line item — the handle every cart mutation takes */
    uuid: { type: "string", default: "" },
    /** @type {string} product ID */
    id: { type: "string", default: "" },
    /** @type {string} display name */
    productName: { type: "string", default: "" },
    /** @type {"product" | "bundle" | "set"} which card shape this line is */
    productType: { type: "string", default: "product" },
    /** @type {boolean} true when the product has left the online catalog */
    noProduct: { type: "boolean", default: false },
    /** @type {{url: string, alt: string} | null} the line item's image */
    image: { transform: lineItemFields.toImage, default: null },
    /** @type {number} quantity ordered */
    quantity: { type: "number", default: 1 },
    /** @type {number} smallest quantity the stepper may reach */
    minQuantity: { type: "number", default: 1 },
    /** @type {number} largest quantity the stepper may reach, from available-to-sell */
    maxQuantity: { type: "number", default: 1 },
    /** @type {{sales: {value: number, formatted: string}|null, list: {value: number, formatted: string}|null, min: {value: number, formatted: string}|null, max: {value: number, formatted: string}|null, isRange: boolean} | null} per-unit catalog price */
    unitPrice: {
      transform: function (price) {
        return PriceData.fromModel(price);
      },
      default: null,
    },
    /** @type {string} formatted line total, discounts applied */
    totalPrice: { type: "string", default: "" },
    /** @type {string} formatted line total before its price adjustments, empty when it has none */
    totalPriceUndiscounted: { type: "string", default: "" },
    /** @type {Array<{displayName: string, displayValue: string}>} variation values ordered */
    variationAttributes: {
      transform: lineItemFields.toVariationAttributes,
      default: function () {
        return [];
      },
    },
    /** @type {Array<{optionId: string, selectedValueId: string, displayName: string}>} chosen product options */
    options: {
      transform: lineItemFields.toOptions,
      default: function () {
        return [];
      },
    },
    /** @type {{messages: string[], inStockDate: string}} availability copy for this quantity */
    availability: {
      transform: function (availability) {
        return {
          messages:
            (availability && availability.messages && availability.messages.map(String)) || [],
          inStockDate: (availability && availability.inStockDate) || "",
        };
      },
      default: function () {
        return { messages: [], inStockDate: "" };
      },
    },
    /** @type {Array<{callOutMsg: string, name: string, details: string}>} promotions discounting this line */
    promotions: {
      transform: function (promotions) {
        if (!promotions) return [];
        return promotions.map(function (promotion) {
          return {
            callOutMsg: promotion.callOutMsg || "",
            name: promotion.name || "",
            details: promotion.details || "",
          };
        });
      },
      default: function () {
        return [];
      },
    },
    /** @type {Array<{id: string, productName: string, image: {url: string, alt: string}|null, variationAttributes: Array<{displayName: string, displayValue: string}>, options: Array<{optionId: string, selectedValueId: string, displayName: string}>}>} what a bundle includes */
    bundledItems: {
      transform: function (items) {
        if (!items) return [];
        return items.map(function (item) {
          return {
            id: item.id || "",
            productName: item.productName || "",
            image: lineItemFields.toImage(item.images),
            variationAttributes: lineItemFields.toVariationAttributes(item.variationAttributes),
            options: lineItemFields.toOptions(item.options),
          };
        });
      },
      default: function () {
        return [];
      },
    },
    /** @type {boolean} true when this line is itself a granted bonus product */
    isBonus: { type: "boolean", default: false },
    /** @type {ICartBonusLineItemData[]} bonus products this line earned */
    bonusProducts: {
      of: CartBonusLineItemData,
      transform: function (items) {
        return (items || []).map(CartBonusLineItemData.fromModel);
      },
      default: function () {
        return [];
      },
    },
    /** @type {Array<{uuid: string, maxPids: number, url: string, canSelect: boolean}>} choice-of-bonus offers this line opened; `url` is a finished Cart-EditBonusProduct URL */
    bonusOffers: {
      transform: function (offers) {
        if (!offers) return [];
        return offers.map(function (offer) {
          return {
            uuid: offer.uuid || "",
            maxPids: offer.maxpids || 0,
            url: offer.url || "",
            // Base named this `full` and then used it to mean the opposite —
            // it is true while the shopper may still pick more.
            canSelect: Boolean(offer.full),
          };
        });
      },
      default: function () {
        return [];
      },
    },
  },
});

/**
 * Map a basket line item model to a plain CartLineItemData object.
 * @param {Object} item - one entry of cartModel.items
 * @returns {Object} plain CartLineItemData object
 */
CartLineItemData.fromModel = function (item) {
  var quantityOptions = item.quantityOptions || {};

  return CartLineItemData.from({
    uuid: item.UUID,
    id: item.id,
    productName: item.productName,
    productType: item.productType || "product",
    noProduct: Boolean(item.noProduct),
    image: item.images,
    quantity: item.quantity,
    minQuantity: quantityOptions.minOrderQuantity,
    maxQuantity: quantityOptions.maxOrderQuantity,
    unitPrice: item.price,
    totalPrice: item.priceTotal && item.priceTotal.price,
    totalPriceUndiscounted: item.priceTotal && item.priceTotal.nonAdjustedPrice,
    variationAttributes: item.variationAttributes,
    options: item.options,
    availability: item.availability,
    promotions: item.appliedPromotions,
    bundledItems: item.bundledProductLineItems,
    isBonus: Boolean(item.isBonusProductLineItem),
    bonusProducts: item.bonusProducts,
    bonusOffers: item.discountLineItems,
  });
};

module.exports = CartLineItemData;
