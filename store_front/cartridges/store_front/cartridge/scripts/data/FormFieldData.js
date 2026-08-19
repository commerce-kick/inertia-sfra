"use strict";

var BaseData = require("../BaseData");
var FormOptionData = require("./FormOptionData");

/**
 * One field of an SFRA form definition, as the frontend needs it.
 *
 * Every form on the storefront — register, profile, password, address,
 * payment — is declared in `forms/default/*.xml` and reaches a controller
 * through `server.forms.getForm(...)`. Base's ISML printed the field's
 * `attributes` string, which is `name` + `required` + `value` + `maxlength` /
 * `minlength` / `pattern` concatenated into markup. Those constraints are the
 * merchant's, not the page's, so they arrive as data here and a React input
 * spreads them — the same rules the server will enforce, enforced in the
 * browser first, without a second copy of them written by hand.
 *
 * What is deliberately *not* here is the input type. Base's templates chose
 * `type="password"` / `type="tel"` per field; the form definition only knows
 * `string`. The component that composes a form names its fields explicitly
 * and picks the type, exactly as the ISML did.
 *
 * Resource keys are resolved server-side, so `label` and `error` arrive as
 * English text (the storefront is English-only) rather than as keys.
 */
var FormFieldData = BaseData.extend({
  schema: {
    /** @type {string} the submitted field name, e.g. dwfrm_profile_customer_email */
    name: { type: "string", default: "" },
    /** @type {string} the field's label */
    label: { type: "string", default: "" },
    /** @type {boolean} whether the definition marks the field required */
    mandatory: { type: "boolean", default: false },
    /** @type {string} the field's current value */
    value: { type: "string", default: "" },
    /** @type {string} the validation message for the value it currently holds, empty while valid */
    error: { type: "string", default: "" },
    /** @type {number} maximum length the definition allows */
    maxLength: { type: "number" },
    /** @type {number} minimum length the definition requires */
    minLength: { type: "number" },
    /** @type {string} the regular expression the definition validates against */
    pattern: { type: "string" },
    /** @type {boolean} current state of a boolean field */
    checked: { type: "boolean" },
    /** @type {IFormOptionData[]} the choices of an option field, empty for a free-text one */
    options: {
      of: FormOptionData,
      transform: function (options) {
        return (options || []).map(FormOptionData.fromOption);
      },
      default: function () {
        return [];
      },
    },
  },
});

/**
 * Map a wrapped SFRA form field to a plain FormFieldData object.
 *
 * `field` is what `server.forms.getForm(...)` hands back for a leaf field
 * (modules/server/forms/formField.js): `htmlName`, `htmlValue`, `mandatory`,
 * `valid`, the resolved `label`/`error`, and — only for the types that have
 * them — `maxLength`, `minLength`, `regEx`, `checked` and `options`.
 *
 * @param {Object} field - a wrapped SFRA form field
 * @returns {Object} plain FormFieldData object
 */
FormFieldData.fromField = function (field) {
  if (!field) return FormFieldData.from({});

  return FormFieldData.from({
    name: field.htmlName,
    label: field.label,
    mandatory: field.mandatory,
    value: field.htmlValue,
    error: field.valid === false ? field.error : "",
    maxLength: field.maxLength,
    minLength: field.minLength,
    pattern: field.regEx,
    checked: field.checked,
    options: field.options,
  });
};

module.exports = FormFieldData;
