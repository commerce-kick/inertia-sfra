"use strict";

var BaseData = require("../BaseData");

/**
 * What every posted form answers with.
 *
 * SFRA's account routes all end the same way — the change is made and the
 * shopper is told where to go next, or it is refused — and they say so in one
 * shape: `{success, redirectUrl}` or `{success: false, fields}`. Nine routes
 * across three waves answer exactly this (sign in, register, reset a
 * password, set a new one, save a profile, change a password, save an
 * address, save a card), which is why it is one DTO and not nine.
 *
 * The two refusals are different in kind: something is wrong with a
 * particular field, or something is wrong with the attempt as a whole.
 *
 * The whole-attempt refusal never reaches this DTO: it travels as the error
 * envelope `app/lib/queries/sfra.ts` unwraps (see answerJson.answerError), so
 * a wrong password rejects the mutation with words worth showing. What stays
 * here is `fields` — base's per-field validation map, keyed by the field's
 * form name (`dwfrm_profile_customer_email`), which is exactly the key the
 * register form already renders each input under.
 *
 * Base wrapped its login failure in an array (`{ error: [message] }`) and its
 * registration server failure in a 500 with `errorMessage`; neither shape
 * survives — both become the one envelope.
 *
 * (Named `AuthResultData` through waves 3 and 4, until the address book and
 * the wallet answered with it too.)
 */
var FormResultData = BaseData.extend({
  schema: {
    /** @type {boolean} whether the shopper is now logged in */
    success: { type: "boolean", default: false },
    /** @type {string} where to go next, resolved server-side from the `rurl` index */
    redirectUrl: { type: "string", default: "" },
    /** @type {Record<string, string>} validation messages keyed by form field name */
    fields: {
      transform: function (fields) {
        var result = {};
        Object.keys(fields || {}).forEach(function (key) {
          result[key] = String(fields[key] || "");
        });
        return result;
      },
      default: function () {
        return {};
      },
    },
  },
});

/**
 * Map what a base form route left in view data to a plain FormResultData
 * object.
 *
 * @param {Object} viewData - the response view data base's res.json merged in
 * @returns {Object} plain FormResultData object
 */
FormResultData.fromViewData = function (viewData) {
  return FormResultData.from({
    success: viewData && viewData.success,
    redirectUrl: viewData && viewData.redirectUrl,
    fields: viewData && viewData.fields,
  });
};

module.exports = FormResultData;
