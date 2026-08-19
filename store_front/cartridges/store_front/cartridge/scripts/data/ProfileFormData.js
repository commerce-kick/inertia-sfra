"use strict";

var BaseData = require("../BaseData");
var FormFieldData = require("./FormFieldData");

/**
 * The `profile` form — one shape for the two surfaces that render it.
 *
 * Registration prints all eight of these fields (base's registerForm.isml, in
 * this order) and posts them to Account-SubmitRegistration; editing a profile
 * prints six of them (no password confirmation, no mailing-list opt-in, and
 * the password field means "confirm it is you") and posts them to
 * Account-SaveProfile. It is the same `server.forms.getForm('profile')` on
 * the server, so it is one DTO here, composed differently by each form —
 * naming the fields is what lets a component pick the ones it renders instead
 * of looping over an untyped bag.
 *
 * The values go back keyed by `name`, which is what base's validation answers
 * under. The form's remaining fields — `currentpassword` and the included
 * `newpasswords` group — belong to the password-change surface and arrive
 * with it.
 */
var ProfileFormData = BaseData.extend({
  schema: {
    /** @type {IFormFieldData} given name */
    firstName: { of: FormFieldData, transform: FormFieldData.fromField, default: null },
    /** @type {IFormFieldData} family name */
    lastName: { of: FormFieldData, transform: FormFieldData.fromField, default: null },
    /** @type {IFormFieldData} phone number */
    phone: { of: FormFieldData, transform: FormFieldData.fromField, default: null },
    /** @type {IFormFieldData} email address, which is also the account's login */
    email: { of: FormFieldData, transform: FormFieldData.fromField, default: null },
    /** @type {IFormFieldData} the email address again */
    emailConfirm: { of: FormFieldData, transform: FormFieldData.fromField, default: null },
    /** @type {IFormFieldData} the new password */
    password: { of: FormFieldData, transform: FormFieldData.fromField, default: null },
    /** @type {IFormFieldData} the new password again */
    passwordConfirm: { of: FormFieldData, transform: FormFieldData.fromField, default: null },
    /** @type {IFormFieldData} opt in to the mailing list */
    addToEmailList: { of: FormFieldData, transform: FormFieldData.fromField, default: null },
  },
});

/**
 * Map the `profile` form to a plain ProfileFormData object.
 * @param {Object} form - server.forms.getForm("profile")
 * @returns {Object} plain ProfileFormData object
 */
ProfileFormData.fromForm = function (form) {
  var customer = (form && form.customer) || {};
  var login = (form && form.login) || {};

  return ProfileFormData.from({
    firstName: customer.firstname,
    lastName: customer.lastname,
    phone: customer.phone,
    email: customer.email,
    emailConfirm: customer.emailconfirm,
    password: login.password,
    passwordConfirm: login.passwordconfirm,
    addToEmailList: customer.addtoemaillist,
  });
};

module.exports = ProfileFormData;
