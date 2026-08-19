"use strict";

var BaseData = require("../BaseData");
var AddressData = require("./AddressData");
var OrderSummaryData = require("./OrderSummaryData");
var PaymentCardData = require("./PaymentCardData");

/**
 * The account dashboard: who the shopper is, plus one glance at each of the
 * four things the account holds — a default address, a saved card, the last
 * order, and the password.
 *
 * Base's `profile.password` is the literal string `********`; it is not
 * carried, because a placeholder is a decision the component can make and a
 * fake secret is not worth putting on the wire.
 *
 * `isExternallyAuthenticated` gates real UI, exactly as in base: an account
 * signed in through Google or Facebook has no password here to change and no
 * phone number of ours to edit, so those surfaces are hidden rather than
 * offered and refused.
 *
 * The wish list and gift registry the two plugin cartridges decorate onto the
 * same model are not typed here — they arrive with their own wave.
 */
var AccountData = BaseData.extend({
  schema: {
    /** @type {{firstName: string, lastName: string, email: string, phone: string}} the shopper's own details */
    profile: {
      transform: function (profile) {
        return {
          firstName: (profile && profile.firstName) || "",
          lastName: (profile && profile.lastName) || "",
          email: (profile && profile.email) || "",
          phone: (profile && profile.phone) || "",
        };
      },
      default: function () {
        return { firstName: "", lastName: "", email: "", phone: "" };
      },
    },
    /** @type {IAddressData} the address book's default, null when none is set */
    preferredAddress: {
      of: AddressData,
      transform: AddressData.fromModel,
      default: null,
    },
    /** @type {IPaymentCardData} the first saved card, null when the wallet is empty */
    payment: {
      of: PaymentCardData,
      transform: PaymentCardData.fromInstrument,
      default: null,
    },
    /** @type {IOrderSummaryData} the most recent order, null for a shopper who has not ordered */
    lastOrder: {
      of: OrderSummaryData,
      transform: OrderSummaryData.fromModel,
      default: null,
    },
    /** @type {number} how many addresses the book holds */
    addressCount: { type: "number", default: 0 },
    /** @type {boolean} true when the account signs in through an external provider */
    isExternallyAuthenticated: { type: "boolean", default: false },
  },
});

/**
 * Map base's account model to a plain AccountData object.
 * @param {Object} model - SFRA account model (accountHelpers.getAccountModel)
 * @returns {Object} plain AccountData object
 */
AccountData.fromModel = function (model) {
  return AccountData.from({
    profile: model && model.profile,
    preferredAddress: model && model.preferredAddress,
    payment: model && model.payment,
    lastOrder: model && model.orderHistory,
    addressCount: model && model.addresses ? model.addresses.length : 0,
    isExternallyAuthenticated: model && model.isExternallyAuthenticated,
  });
};

module.exports = AccountData;
