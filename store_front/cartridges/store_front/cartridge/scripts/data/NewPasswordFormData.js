"use strict";

var BaseData = require("../BaseData");
var FormFieldData = require("./FormFieldData");

/**
 * The `newPasswords` form: the pair a password change is made of.
 *
 * Base's newPasswordForm.isml printed exactly these two fields and posted
 * them to Account-SaveNewPassword under the names carried here — which is
 * also how base's per-field verdict finds its input again. The site's own
 * length rules ride along on each field, so the browser holds the shopper to
 * the same 8–255 the platform will.
 */
var NewPasswordFormData = BaseData.extend({
  schema: {
    /** @type {IFormFieldData} the new password */
    newPassword: { of: FormFieldData, transform: FormFieldData.fromField, default: null },
    /** @type {IFormFieldData} the new password again */
    newPasswordConfirm: { of: FormFieldData, transform: FormFieldData.fromField, default: null },
  },
});

/**
 * Map the `newPasswords` form to a plain NewPasswordFormData object.
 * @param {Object} form - server.forms.getForm("newPasswords")
 * @returns {Object} plain NewPasswordFormData object
 */
NewPasswordFormData.fromForm = function (form) {
  return NewPasswordFormData.from({
    newPassword: form && form.newpassword,
    newPasswordConfirm: form && form.newpasswordconfirm,
  });
};

module.exports = NewPasswordFormData;
