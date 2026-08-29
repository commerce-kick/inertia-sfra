"use strict";

var BaseData = require("../BaseData");
var CheckoutOrderData = require("./CheckoutOrderData");

/**
 * The order that now exists, on the page that says so.
 *
 * Its contents, money, shipping and billing are `CheckoutOrderData` — the
 * same shape the checkout carried a moment earlier, built from the same
 * OrderModel — because a confirmation *is* the basket that just became an
 * order. What it adds is the three facts only an order has: its number, when
 * it was placed, and where it stands.
 *
 * `creationDate` is formatted server-side for the same reason
 * `OrderSummaryData`'s is (4.1): a JSON prop cannot carry a Date, and the
 * storefront is English-only.
 */
var OrderConfirmationData = BaseData.extend({
  schema: {
    /** @type {string} the order number */
    orderNumber: { type: "string", default: "" },
    /** @type {string} when it was placed, formatted */
    creationDate: { type: "string", default: "" },
    /** @type {string} the order's status, as the platform names it */
    status: { type: "string", default: "" },
    /** @type {ICheckoutOrderData} what was ordered, and what it cost */
    order: {
      of: CheckoutOrderData,
      transform: function (model) {
        return model ? CheckoutOrderData.fromModel(model) : null;
      },
      default: null,
    },
    /** @type {boolean} whether the shopper was signed in when they ordered */
    returningCustomer: { type: "boolean", default: false },
  },
});

/**
 * Map a placed order's model to a plain OrderConfirmationData object.
 * @param {Object} model - SFRA OrderModel built with containerView "order"
 * @param {boolean} returningCustomer - whether the shopper has an account
 * @returns {Object} plain OrderConfirmationData object
 */
OrderConfirmationData.fromModel = function (model, returningCustomer) {
  var Calendar = require("dw/util/Calendar");
  var StringUtils = require("dw/util/StringUtils");

  var status = model && model.orderStatus;

  return OrderConfirmationData.from({
    orderNumber: model && model.orderNumber,
    creationDate:
      model && model.creationDate
        ? StringUtils.formatCalendar(new Calendar(model.creationDate), "MMM d, yyyy")
        : "",
    status: status && status.displayValue ? status.displayValue : String(status || ""),
    order: model,
    returningCustomer: returningCustomer,
  });
};

module.exports = OrderConfirmationData;
