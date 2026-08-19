"use strict";

var BaseData = require("../BaseData");
var CheckoutOrderData = require("./CheckoutOrderData");

/**
 * What every checkout JSON route answers with.
 *
 * Base's eleven checkout routes all reply with some subset of the same five
 * things: the re-rendered order, a bag of field errors, a list of server
 * errors, a form, and sometimes a redirect. The form is dropped (its fields
 * came down with the page and the client still holds them), the two error
 * lists collapse — per-field errors stay per field, and anything not tied to
 * a field becomes a message — and the order is typed.
 *
 * A refusal the shopper can do nothing about (no basket, a declined payment,
 * a technical failure) never reaches this DTO at all: it travels as the error
 * envelope `app/lib/queries/sfra.ts` unwraps, so those reject.
 */
var CheckoutResultData = BaseData.extend({
  schema: {
    /** @type {ICheckoutOrderData} the basket as it now stands, null when the route only validated */
    order: {
      of: CheckoutOrderData,
      transform: function (model) {
        return model ? CheckoutOrderData.fromModel(model) : null;
      },
      default: null,
    },
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
    /** @type {string} a refusal that names no field but does not abandon the stage */
    message: { type: "string", default: "" },
    /** @type {string} where base wanted the shopper next, empty when it wanted them to stay */
    redirectUrl: { type: "string", default: "" },
  },
});

module.exports = CheckoutResultData;
