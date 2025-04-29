function isInertia(req) {
  return (
    req.httpHeaders["X-SF-CC-Inertia"] === "true" ||
    req.httpHeaders["x-sf-cc-inertia"] === "true" ||
    req.httpHeaders["x-inertia"] === "true"
  );
}

function isPartialComponent(req) {
  return req.httpHeaders["x-inertia-partial-component"];
}

function partialProps(req) {
  const partial = req.httpHeaders["x-inertia-partial-data"];
  // Return null or empty array if partial doesn't exist
  if (!partial) {
    return null; // or return []; if you prefer an empty array
  }

  // Split the comma-separated string into an array
  return partial.split(",");
}

/**
 * Recursively process an SFCC response object to convert all dw.web.URL objects to strings
 * @param {Object} obj - The object to process
 * @returns {Object} - The object with all dw.web.URL objects converted to strings
 */
function processUrls(obj) {
  // Handle null/undefined or non-objects
  if (obj === null || obj === undefined || typeof obj !== "object") {
      return obj;
  }

  // Check if this is a dw.web.URL object using instanceof
  if (obj instanceof dw.web.URL) {
      // Call toString() to convert the URL object to a string
      return obj.toString();
  }

  // Handle arrays
  if (Array.isArray(obj)) {
      for (var i = 0; i < obj.length; i++) {
          obj[i] = processUrls(obj[i]);
      }
      return obj;
  }

  // Process object properties directly
  try {
      Object.keys(obj).forEach(function(key) {
          // Recursively process the object
          obj[key] = processUrls(obj[key]);
      });
  } catch (e) {
      // Consider logging the error here for debugging
      var Logger = require('dw/system/Logger');
      Logger.error("Error processing object property: " + e.message);
      // Potentially rethrow the error or handle it more specifically
      return obj;
  }

  return obj;
}

module.exports = {
  isInertia: isInertia,
  isPartialComponent: isPartialComponent,
  partialProps: partialProps,
  processUrls: processUrls,
};
