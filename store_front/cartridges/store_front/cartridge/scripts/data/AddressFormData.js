"use strict";

var BaseData = require("../BaseData");
var FormFieldData = require("./FormFieldData");

/**
 * The `address` form, as both the add and the edit surface render it.
 *
 * Two of these fields are option lists the merchant owns rather than free
 * text — `country` (the countries the site ships to) and `state` (from the
 * shared `states` form the definition includes) — which is what
 * `FormFieldData.options` exists for: the select is built from the site's own
 * list, never from an array written into the frontend.
 *
 * `addressId` is not a key the platform generates; it is the shopper's label
 * for the address ("Home", "Office"), unique within their book, which is why
 * base validates it and answers "that ID already exists" on the field.
 */
var AddressFormData = BaseData.extend({
  schema: {
    /** @type {IFormFieldData} the shopper's label for this address */
    addressId: { of: FormFieldData, transform: FormFieldData.fromField, default: null },
    /** @type {IFormFieldData} given name */
    firstName: { of: FormFieldData, transform: FormFieldData.fromField, default: null },
    /** @type {IFormFieldData} family name */
    lastName: { of: FormFieldData, transform: FormFieldData.fromField, default: null },
    /** @type {IFormFieldData} street line */
    address1: { of: FormFieldData, transform: FormFieldData.fromField, default: null },
    /** @type {IFormFieldData} second street line */
    address2: { of: FormFieldData, transform: FormFieldData.fromField, default: null },
    /** @type {IFormFieldData} city */
    city: { of: FormFieldData, transform: FormFieldData.fromField, default: null },
    /** @type {IFormFieldData} state or province, an option list */
    stateCode: { of: FormFieldData, transform: FormFieldData.fromField, default: null },
    /** @type {IFormFieldData} postal code */
    postalCode: { of: FormFieldData, transform: FormFieldData.fromField, default: null },
    /** @type {IFormFieldData} country, an option list of what the site ships to */
    country: { of: FormFieldData, transform: FormFieldData.fromField, default: null },
    /** @type {IFormFieldData} phone number */
    phone: { of: FormFieldData, transform: FormFieldData.fromField, default: null },
  },
});

/**
 * Map the `address` form to a plain AddressFormData object.
 * @param {Object} form - server.forms.getForm("address")
 * @returns {Object} plain AddressFormData object
 */
AddressFormData.fromForm = function (form) {
  var states = (form && form.states) || {};

  return AddressFormData.from({
    addressId: form && form.addressId,
    firstName: form && form.firstName,
    lastName: form && form.lastName,
    address1: form && form.address1,
    address2: form && form.address2,
    city: form && form.city,
    stateCode: states.stateCode,
    postalCode: form && form.postalCode,
    country: form && form.country,
    phone: form && form.phone,
  });
};

module.exports = AddressFormData;
