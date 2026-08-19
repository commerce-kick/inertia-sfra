"use strict";

var BaseData = require("../BaseData");
var AddressData = require("./AddressData");

/**
 * How the basket is being paid for: the billing address, what the site
 * accepts, and what has been put against the order so far.
 *
 * `selectedPaymentInstruments` is what the review stage prints — never the
 * number, only what the platform is willing to show of it. Base's shape is
 * kept, minus the gift-certificate branch: RefArch's checkout offers credit
 * card only, and a branch for a payment method the storefront cannot add
 * would be UI with nothing behind it.
 */
var CheckoutBillingData = BaseData.extend({
  schema: {
    /** @type {IAddressData} where the card is registered, null before one is entered */
    billingAddress: {
      of: AddressData,
      transform: AddressData.fromModel,
      default: null,
    },
    /** @type {string} ID of the saved address this one matches, empty when it matches none */
    matchingAddressId: { type: "string", default: "" },
    /** @type {Array<{id: string, name: string}>} the payment methods the site accepts for this basket */
    applicablePaymentMethods: {
      transform: function (methods) {
        return (methods || []).map(function (method) {
          return { id: method.ID || "", name: method.name || "" };
        });
      },
      default: function () {
        return [];
      },
    },
    /** @type {Array<{cardType: string, name: string}>} the card types it accepts */
    applicablePaymentCards: {
      transform: function (cards) {
        return (cards || []).map(function (card) {
          return { cardType: card.cardType || "", name: card.name || "" };
        });
      },
      default: function () {
        return [];
      },
    },
    /** @type {Array<{paymentMethod: string, amount: number, maskedNumber: string, cardType: string, owner: string, expirationMonth: number, expirationYear: number}>} what is set against the order */
    selectedPaymentInstruments: {
      transform: function (instruments) {
        return (instruments || []).map(function (instrument) {
          return {
            paymentMethod: instrument.paymentMethod || "",
            amount: instrument.amount || 0,
            maskedNumber: instrument.maskedCreditCardNumber || "",
            cardType: instrument.type || "",
            owner: instrument.owner || "",
            expirationMonth: instrument.expirationMonth || 0,
            expirationYear: instrument.expirationYear || 0,
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
 * Map an SFRA billing model to a plain CheckoutBillingData object.
 * @param {Object} model - SFRA billing model (order.billing)
 * @returns {Object} plain CheckoutBillingData object
 */
CheckoutBillingData.fromModel = function (model) {
  var payment = (model && model.payment) || {};

  return CheckoutBillingData.from({
    billingAddress: model && model.billingAddress,
    matchingAddressId:
      model && typeof model.matchingAddressId === "string" ? model.matchingAddressId : "",
    applicablePaymentMethods: payment.applicablePaymentMethods,
    applicablePaymentCards: payment.applicablePaymentCards,
    selectedPaymentInstruments: payment.selectedPaymentInstruments,
  });
};

module.exports = CheckoutBillingData;
