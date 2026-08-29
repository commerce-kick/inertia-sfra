"use strict";

var BaseData = require("../BaseData");
var AddressFormData = require("./AddressFormData");
var CreditCardFormData = require("./CreditCardFormData");
var FormFieldData = require("./FormFieldData");

/**
 * Every field the four checkout stages ask for, in one prop.
 *
 * Base hands its template four separate form objects (`coCustomer`,
 * `coRegisteredCustomer`, `shipping`, `billing`), and the last two are mostly
 * *includes* of forms the port already types: `shipping.shippingAddress
 * .addressFields` and `billing.addressFields` are both the `address` form —
 * so `AddressFormData` reads them unchanged — and `billing.creditCardFields`
 * is the `creditCard` form `CreditCardFormData` already describes.
 *
 * That is the whole reason these are one shape: nothing new had to be
 * declared for checkout except the two contact fields and the two customer
 * ones, which are single fields rather than forms.
 */
var CheckoutFormsData = BaseData.extend({
  schema: {
    /** @type {IFormFieldData} the guest's email, from the coCustomer form */
    guestEmail: { of: FormFieldData, transform: FormFieldData.fromField, default: null },
    /** @type {IFormFieldData} the returning shopper's email */
    loginEmail: { of: FormFieldData, transform: FormFieldData.fromField, default: null },
    /** @type {IFormFieldData} the returning shopper's password */
    loginPassword: { of: FormFieldData, transform: FormFieldData.fromField, default: null },
    /** @type {IAddressFormData} where the order ships */
    shippingAddress: {
      of: AddressFormData,
      transform: AddressFormData.fromForm,
      default: null,
    },
    /** @type {IFormFieldData} the chosen shipping method, a field of the shipping form itself */
    shippingMethodId: { of: FormFieldData, transform: FormFieldData.fromField, default: null },
    /** @type {IFormFieldData} bill to the shipping address */
    useAsBilling: { of: FormFieldData, transform: FormFieldData.fromField, default: null },
    /** @type {IAddressFormData} where the card is registered */
    billingAddress: {
      of: AddressFormData,
      transform: AddressFormData.fromForm,
      default: null,
    },
    /** @type {IFormFieldData} which payment method is paying — CREDIT_CARD is the only one RefArch offers */
    paymentMethod: { of: FormFieldData, transform: FormFieldData.fromField, default: null },
    /** @type {ICreditCardFormData} the card itself */
    card: { of: CreditCardFormData, transform: CreditCardFormData.fromForm, default: null },
    /** @type {IFormFieldData} the phone number the order is contactable on */
    contactPhone: { of: FormFieldData, transform: FormFieldData.fromField, default: null },
    /** @type {IFormFieldData} the card's security code, asked only at checkout */
    securityCode: { of: FormFieldData, transform: FormFieldData.fromField, default: null },
  },
});

/**
 * Map base's four checkout forms to a plain CheckoutFormsData object.
 *
 * @param {Object} forms - base's `forms` view data
 * @param {Array<string>} years - the expiration years base's controller computed
 * @returns {Object} plain CheckoutFormsData object
 */
CheckoutFormsData.fromForms = function (forms, years) {
  var guest = (forms && forms.guestCustomerForm) || {};
  var registered = (forms && forms.registeredCustomerForm) || {};
  var shipping = (forms && forms.shippingForm) || {};
  var billing = (forms && forms.billingForm) || {};
  var shippingAddress = shipping.shippingAddress || {};

  var data = CheckoutFormsData.from({
    guestEmail: guest.email,
    loginEmail: registered.email,
    loginPassword: registered.password,
    shippingAddress: shippingAddress.addressFields,
    shippingMethodId: shippingAddress.shippingMethodID,
    useAsBilling: shippingAddress.shippingAddressUseAsBillingAddress,
    billingAddress: billing.addressFields,
    paymentMethod: billing.paymentMethod,
    card: billing.creditCardFields,
    contactPhone: billing.contactInfoFields && billing.contactInfoFields.phone,
    securityCode: billing.creditCardFields && billing.creditCardFields.securityCode,
  });

  // The expiration years are base's own list, computed in the controller
  // because the form definition leaves that field's options empty — the same
  // merge PaymentInstruments-AddPayment does (5.8).
  if (data.card) {
    data.card.expirationYear.options = (years || []).map(function (year) {
      return { id: String(year), label: String(year), value: String(year), selected: false };
    });
  }

  return data;
};

module.exports = CheckoutFormsData;
