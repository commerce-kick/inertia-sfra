"use strict";

/**
 * @description The AuthService API error code we're checking for
 * @type {Number}
 */
var ERROR_401 = 401;

/**
 * @description Expands a JSON String into an object.  Takes a JSON string and attempts
 * to deserialize it.  A default value can be applied in the event that deserialization fails.
 *
 * @param {String} jsonString Represents the JSON String being expanded and deserialized.
 * @param {*} defaultValue Represents the default value to be applied to the variable if the JSON
 * string could not be expanded / deserialized.
 * @returns {*} Returns undefined if empty string or exception encountered
 */
function expandJSON(jsonString, defaultValue) {
  var output = defaultValue;
  try {
    output = jsonString ? JSON.parse(jsonString) : defaultValue;
  } catch (e) {
    require("dw/system/Logger")
      .getLogger("crm_connector", "util/helpers")
      .error("Error parsing JSON: {0}", e);
  }
  return output;
}

/**
 * @description Returns the service related to the given {serviceName}
 * initialized with the given {definition}.
 *
 * @param {String} serviceName The name of the server
 * @param {Object} definition The definition to use while initializing the service
 * @return {dw/svc/Service} A new service instance
 */
function getService(serviceName, definition) {
  var LocalServiceRegistry = require("dw/svc/LocalServiceRegistry");

  return LocalServiceRegistry.createService(serviceName, definition);
}

/**
 * @description Attempt to set to site-specific credential to the given service. If it fails,
 * the credential will fallback to the original ID.
 *
 * @param  {dw/svc/HTTPService} svc The service on which to apply the credentials
 * @param  {String} id The id of the credential to apply
 */
function setCredentialID(svc, id) {
  try {
    svc.setCredentialID(id);
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = {
  /**
   * @description Gets the REST Service according to the given {model} and {state} and calls it.
   * @param {String} endpoint The endpoint of the service
   * @param {Object} requestBody The request body to send to the service
   * @param {Boolean} [bypassCache] If true, then the authentication token will be retrieved from
   * the Salesforce Platform, not from the cache
   * @param {Number} CallCount Number of retries
   * @returns {Object} The serviceCall result that can be parsed and processed
   */
  callRestService: function callRestService(requestBody, CallCount) {
    var maxServiceRetry = 1;
    var thisCallCount = CallCount || 1;

    var service = getService("inertia.ssr", {
      createRequest: function (svc, body) {
        svc.setRequestMethod('POST');
        svc.addHeader("Content-Type", "application/json");
        return body;
      },
      parseResponse: function parseResponse(svc, client) {
        return expandJSON(client.text, client.text);
      },
    });

    var result = service.call(requestBody);
    thisCallCount++;

    if (
      result.status !== "OK" &&
      result.error === ERROR_401 &&
      thisCallCount <= maxServiceRetry
    ) {
      // Always bypass the custom cache in case of a retry
      // to ensure getting the auth token from the Salesforce Platform
      return module.exports.callRestService(requestBody, thisCallCount);
    }

    return result;
  },
};
