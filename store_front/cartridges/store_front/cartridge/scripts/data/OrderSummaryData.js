"use strict";

var BaseData = require("../BaseData");

/**
 * One order, at the size the account surfaces show it: the dashboard's "most
 * recent order" card and — when wave 7 lands — the rows of the order list.
 *
 * Base builds it with `numberOfLineItems: 'single'`, which is why only the
 * first line's image travels: the card is a glance, not a receipt.
 *
 * `creationDate` arrives formatted. Base handed the raw date to `<isprint>`
 * and let the platform format it per locale; a JSON prop cannot carry a Date,
 * and the storefront is English-only, so it is formatted server-side once.
 */
var OrderSummaryData = BaseData.extend({
  schema: {
    /** @type {string} the order number */
    orderNumber: { type: "string", default: "" },
    /** @type {string} when it was placed, formatted */
    creationDate: { type: "string", default: "" },
    /** @type {string} the order's status, as the platform names it */
    status: { type: "string", default: "" },
    /** @type {number} total quantity across the order's lines */
    quantityTotal: { type: "number", default: 0 },
    /** @type {string} formatted grand total */
    total: { type: "string", default: "" },
    /** @type {string} who it shipped to */
    shippedTo: { type: "string", default: "" },
    /** @type {{url: string, alt: string, title: string}} the first line's image, null when the order has none */
    image: {
      transform: function (image) {
        return image
          ? {
              url: image.imageURL || "",
              alt: image.alt || "",
              title: image.title || "",
            }
          : null;
      },
      default: null,
    },
  },
});

/**
 * Map an SFRA order model to a plain OrderSummaryData object.
 * @param {Object} model - SFRA OrderModel built with numberOfLineItems "single"
 * @returns {Object|null} plain OrderSummaryData object, or null
 */
OrderSummaryData.fromModel = function (model) {
  if (!model) return null;

  var Calendar = require("dw/util/Calendar");
  var StringUtils = require("dw/util/StringUtils");

  var status = model.orderStatus;
  var shippedTo = [model.shippedToFirstName, model.shippedToLastName]
    .filter(Boolean)
    .join(" ");

  return OrderSummaryData.from({
    orderNumber: model.orderNumber,
    creationDate: model.creationDate
      ? StringUtils.formatCalendar(new Calendar(model.creationDate), "MMM d, yyyy")
      : "",
    status: status && status.displayValue ? status.displayValue : String(status || ""),
    quantityTotal: model.productQuantityTotal,
    total: model.priceTotal,
    shippedTo: shippedTo,
    image: model.firstLineItem,
  });
};

module.exports = OrderSummaryData;
