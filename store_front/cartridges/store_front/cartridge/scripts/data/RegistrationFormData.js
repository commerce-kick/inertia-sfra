"use strict";

var BaseData = require("../BaseData");
var FormFieldData = require("./FormFieldData");

/**
 * The `profile` form as the registration surface renders it.
 *
 * Base's registerForm.isml printed these eight fields of `server.forms
 * .getForm('profile')` in this order, and posted them to
 * Account-SubmitRegistration under the names carried here. Naming them makes
 * the shape typed on both sides: the form component composes named fields
 * instead of looping over an untyped bag, and the values it hands the
 * mutation are keyed by `name`, which is what base's validation answers under.
 *
 * The form's other fields — `currentpassword` and the included `newpasswords`
 * group — belong to the profile and password-change surfaces, not to
 * registration, and arrive with those rows.
 */
var RegistrationFormData = BaseData.extend({
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
 * Map the `profile` form to a plain RegistrationFormData object.
 * @param {Object} form - server.forms.getForm("profile")
 * @returns {Object} plain RegistrationFormData object
 */
RegistrationFormData.fromForm = function (form) {
  var customer = (form && form.customer) || {};
  var login = (form && form.login) || {};

  return RegistrationFormData.from({
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

module.exports = RegistrationFormData;
