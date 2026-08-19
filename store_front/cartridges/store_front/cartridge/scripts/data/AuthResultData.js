"use strict";

var BaseData = require("../BaseData");

/**
 * What the two credential routes answer: Account-Login and
 * Account-SubmitRegistration.
 *
 * Both end the same way — the shopper is logged in and told where to go next
 * (Account-Show, or Checkout-Begin when the sign-in was entered from the
 * checkout gate; base maps the `rurl` index to the endpoint) — and both can
 * refuse in the same two ways: something is wrong with a particular field, or
 * something is wrong with the attempt as a whole.
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
 */
var AuthResultData = BaseData.extend({
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
 * Map what a base credential route left in view data to a plain
 * AuthResultData object.
 *
 * @param {Object} viewData - the response view data base's res.json merged in
 * @returns {Object} plain AuthResultData object
 */
AuthResultData.fromViewData = function (viewData) {
  return AuthResultData.from({
    success: viewData && viewData.success,
    redirectUrl: viewData && viewData.redirectUrl,
    fields: viewData && viewData.fields,
  });
};

module.exports = AuthResultData;
