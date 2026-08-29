"use strict";

var BaseData = require("../BaseData");

/**
 * One postal address, as base's AddressModel exposes it.
 *
 * The whole address book, the checkout's shipping and billing steps and the
 * account dashboard all read the same seven lines plus a phone number, so
 * this is the shape they share. `id` is the shopper's own name for it ("Home",
 * "Office") and only saved addresses carry one.
 */
var AddressData = BaseData.extend({
  schema: {
    /** @type {string} the shopper's name for this address, empty for an unsaved one */
    id: { type: "string", default: "" },
    /** @type {string} the platform's UUID for the stored address */
    uuid: { type: "string", default: "" },
    /** @type {boolean} whether this is the address book's default */
    isDefault: { type: "boolean", default: false },
    /** @type {string} given name */
    firstName: { type: "string", default: "" },
    /** @type {string} family name */
    lastName: { type: "string", default: "" },
    /** @type {string} street line */
    address1: { type: "string", default: "" },
    /** @type {string} second street line, empty when unused */
    address2: { type: "string", default: "" },
    /** @type {string} city */
    city: { type: "string", default: "" },
    /** @type {string} state or province code */
    stateCode: { type: "string", default: "" },
    /** @type {string} postal code */
    postalCode: { type: "string", default: "" },
    /** @type {string} ISO country code */
    countryCode: { type: "string", default: "" },
    /** @type {string} phone number */
    phone: { type: "string", default: "" },
  },
});

/**
 * Map an SFRA address model to a plain AddressData object.
 *
 * Accepts either the model (`{ address: {...} }`) or the inner address, since
 * base hands both shapes around, and answers null when there is no address —
 * "no default address" is a state the dashboard renders.
 *
 * @param {Object} model - SFRA AddressModel, or its inner address object
 * @param {boolean} [isDefault] - whether this is the book's preferred address
 * @returns {Object|null} plain AddressData object, or null
 */
AddressData.fromModel = function (model, isDefault) {
  var address = (model && model.address) || model;
  if (!address) return null;

  return AddressData.from({
    id: address.ID,
    uuid: address.UUID,
    isDefault: isDefault,
    firstName: address.firstName,
    lastName: address.lastName,
    address1: address.address1,
    address2: address.address2,
    city: address.city,
    stateCode: address.stateCode,
    postalCode: address.postalCode,
    countryCode:
      address.countryCode && address.countryCode.value
        ? address.countryCode.value
        : address.countryCode,
    phone: address.phone,
  });
};

module.exports = AddressData;
