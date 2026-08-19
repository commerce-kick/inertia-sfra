"use strict";

/**
 * Answer a JSON route with a typed payload, discarding whatever view data the
 * base route left behind.
 *
 * `res.json` *merges* into view data (modules/server/response.js), so an
 * appended JSON step would otherwise ship base's untyped model — and, on the
 * account routes, live dw.customer objects — alongside the typed one.
 * Resetting first is the same move the adapter makes before it emits a page,
 * and it is what lets these routes append, keeping base's transactions,
 * validation and emails, instead of replacing them.
 *
 * @param {Object} res - the SFRA response
 * @param {Object} payload - the DTO object to answer with
 * @returns {void}
 */
function answerJson(res, payload) {
  res.viewData = {};
  res.json(payload);
}

/**
 * Answer with the failure envelope `app/lib/queries/sfra.ts` unwraps for every
 * SFRA endpoint, so a hook only ever sees a DTO or a rejection carrying real
 * text. Base signals failure in several shapes across the account routes — an
 * array of messages, a bare `errorMessage`, sometimes alongside a 500 that
 * would reject in the browser before anything read the body — so the status is
 * normalized back to 200 and the reason travels in the envelope.
 *
 * @param {Object} res - the SFRA response
 * @param {string} message - what went wrong, in words worth showing
 * @param {string} [redirectUrl] - base's "start over somewhere else" signal
 * @returns {void}
 */
function answerError(res, message, redirectUrl) {
  res.setStatusCode(200);
  answerJson(res, {
    error: true,
    errorMessage: message || "",
    redirectUrl: redirectUrl || "",
  });
}

module.exports = {
  answerJson: answerJson,
  answerError: answerError,
};
