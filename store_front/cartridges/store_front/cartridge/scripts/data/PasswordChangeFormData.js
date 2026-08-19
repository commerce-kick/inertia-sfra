"use strict";

var BaseData = require("../BaseData");
var FormFieldData = require("./FormFieldData");

/**
 * The three fields a signed-in password change is made of, as base's
 * changePasswordForm.isml printed them: the password in force now, and the
 * new one twice.
 *
 * They live in the `profile` form — `login.currentpassword` plus the
 * `newpasswords` group the form definition includes into it — which is why
 * their names are the long ones the mutation posts back.
 *
 * The close sibling `NewPasswordFormData` is the token-authorized pair from
 * the forgotten-password flow: a different form, a different authorization,
 * two fields instead of three.
 */
var PasswordChangeFormData = BaseData.extend({
  schema: {
    /** @type {IFormFieldData} the password in force now, which authorizes the change */
    currentPassword: { of: FormFieldData, transform: FormFieldData.fromField, default: null },
    /** @type {IFormFieldData} the new password */
    newPassword: { of: FormFieldData, transform: FormFieldData.fromField, default: null },
    /** @type {IFormFieldData} the new password again */
    newPasswordConfirm: { of: FormFieldData, transform: FormFieldData.fromField, default: null },
  },
});

/**
 * Map the `profile` form's login group to a plain PasswordChangeFormData object.
 * @param {Object} form - server.forms.getForm("profile")
 * @returns {Object} plain PasswordChangeFormData object
 */
PasswordChangeFormData.fromForm = function (form) {
  var login = (form && form.login) || {};
  var newPasswords = login.newpasswords || {};

  return PasswordChangeFormData.from({
    currentPassword: login.currentpassword,
    newPassword: newPasswords.newpassword,
    newPasswordConfirm: newPasswords.newpasswordconfirm,
  });
};

module.exports = PasswordChangeFormData;
