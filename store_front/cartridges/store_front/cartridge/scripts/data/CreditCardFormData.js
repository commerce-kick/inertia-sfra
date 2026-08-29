"use strict";

var BaseData = require("../BaseData");
var FormFieldData = require("./FormFieldData");

/**
 * The `creditCard` form, as the save-a-card surface renders it.
 *
 * Four of the definition's fields are not here, and each for a reason base
 * gives: `securityCode` is not asked when a card is only being stored (it is
 * a checkout-time value), `editNumber` and `paymentMethod` are hidden
 * plumbing for base's Bootstrap radio group with one option, and `saveCard`
 * belongs to checkout's "save this card" choice, not to a page whose whole
 * purpose is saving one.
 *
 * `cardType` is a hidden field base filled in from client-side script
 * watching the number; it is carried so the component can fill it the same
 * way, from the number's prefix.
 *
 * `expirationYear` is the one field whose options the definition leaves empty
 * — base's controller computes ten years from the current one and hands them
 * to the template separately. They are merged onto the field here, so the
 * component sees one select with its choices, like every other option field.
 */
var CreditCardFormData = BaseData.extend({
  schema: {
    /** @type {IFormFieldData} the name on the card */
    cardOwner: { of: FormFieldData, transform: FormFieldData.fromField, default: null },
    /** @type {IFormFieldData} the card number */
    cardNumber: { of: FormFieldData, transform: FormFieldData.fromField, default: null },
    /** @type {IFormFieldData} card type, derived from the number rather than chosen */
    cardType: { of: FormFieldData, transform: FormFieldData.fromField, default: null },
    /** @type {IFormFieldData} expiry month, an option list of 01-12 */
    expirationMonth: { of: FormFieldData, transform: FormFieldData.fromField, default: null },
    /** @type {IFormFieldData} expiry year, an option list the controller computes */
    expirationYear: { of: FormFieldData, transform: FormFieldData.fromField, default: null },
  },
});

/**
 * Map the `creditCard` form to a plain CreditCardFormData object.
 * @param {Object} form - server.forms.getForm("creditCard")
 * @param {Array<string>} years - the expiration years base's controller computed
 * @returns {Object} plain CreditCardFormData object
 */
CreditCardFormData.fromForm = function (form, years) {
  var data = CreditCardFormData.from({
    cardOwner: form && form.cardOwner,
    cardNumber: form && form.cardNumber,
    cardType: form && form.cardType,
    expirationMonth: form && form.expirationMonth,
    expirationYear: form && form.expirationYear,
  });

  data.expirationYear.options = (years || []).map(function (year) {
    return { id: year, label: year, value: year, selected: false };
  });

  return data;
};

module.exports = CreditCardFormData;
