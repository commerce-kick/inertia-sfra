"use strict";

var answerJson = require("./answerJson");

/**
 * Base reports field errors as an *array* of maps — one per form it
 * validated — because it validated several forms per request. One flat map is
 * what a form renders from, and the keys are already unique (they are the
 * fields' full HTML names), so the array collapses without losing anything.
 *
 * @param {Array} fieldErrors - base's `fieldErrors`
 * @returns {Object} one map of field name to message
 */
function flattenFieldErrors(fieldErrors) {
  var flat = {};

  (fieldErrors || []).forEach(function (bag) {
    Object.keys(bag || {}).forEach(function (key) {
      flat[key] = String(bag[key] || "");
    });
  });

  return flat;
}

/**
 * Answer a checkout route with the basket it produced, the field errors it
 * refused with, or the envelope for a refusal the shopper cannot act on.
 *
 * The three cases in base's own terms:
 *  - `cartError`, or an error with nothing to show for it — the basket is
 *    gone or something failed technically. That rejects, carrying base's
 *    `redirectUrl` where it gave one, which the client already follows.
 *  - errors against named fields — the stage stays open and each message
 *    lands on its field.
 *  - anything else — the re-rendered order, which is what moves the totals on
 *    screen after a shipping method or an address changes.
 *
 * @param {Object} res - the SFRA response
 * @returns {void}
 */
function answerCheckout(res) {
  var CheckoutResultData = require("*/cartridge/scripts/data/CheckoutResultData");

  var viewData = res.getViewData();
  var fields = flattenFieldErrors(viewData.fieldErrors);
  var serverErrors = viewData.serverErrors || [];
  var hasFields = Object.keys(fields).length > 0;

  var message =
    viewData.customerErrorMessage
    || viewData.errorMessage
    || serverErrors[0]
    || viewData.message
    || "";

  if (viewData.cartError || (viewData.error && !hasFields && !viewData.order)) {
    answerJson.answerError(res, message, viewData.redirectUrl);
    return;
  }

  answerJson.answerJson(
    res,
    CheckoutResultData.from({
      order: viewData.order,
      fields: fields,
      message: hasFields ? "" : message,
      redirectUrl: viewData.redirectUrl,
    })
  );
}

module.exports = {
  answerCheckout: answerCheckout,
  flattenFieldErrors: flattenFieldErrors,
};
