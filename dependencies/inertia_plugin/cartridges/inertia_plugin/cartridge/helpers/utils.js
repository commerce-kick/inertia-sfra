var Headers = {
  Inertia: "X-SF-CC-Inertia",
  ErrorBag: "X-SF-CC-Inertia-Error-Bag",
  Location: "X-SF-CC-Inertia-Location",
  Version: "X-SF-CC-Inertia-Version",
  PartialComponent: "X-SF-CC-Inertia-Partial-Component",
  PartialOnly: "X-SF-CC-Inertia-Partial-Data",
  PartialExcept: "X-SF-CC-Inertia-Partial-Except",
  Reset: "X-SF-CC-Inertia-Reset",
  InfiniteScrollMergeIntent: "X-SF-CC-Inertia-Infinite-Scroll-Merge-Intent",
  ExceptOnceProps: "X-SF-CC-Inertia-Except-Once-Props"
};

function hashString(str) {
  var hash = 5381;
  var input = String(str || "");
  for (var i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash) + input.charCodeAt(i);
    hash = hash & 0xffffffff;
  }
  if (hash < 0) {
    hash = 0xffffffff + hash + 1;
  }
  return ("00000000" + hash.toString(16)).slice(-8);
}

function assetsVersion() {
  try {
    var manifest = require("*/cartridge/static/default/manifest.json") || {};
    var keys = Object.keys(manifest).sort();
    var parts = [];

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var entry = manifest[key];

      if (!entry || typeof entry !== "object") {
        parts.push(key + ":" + String(entry));
        continue;
      }

      var file = entry.file ? String(entry.file) : "";
      var css = Array.isArray(entry.css) ? entry.css.map(String).sort().join(",") : "";
      var imports = Array.isArray(entry.imports) ? entry.imports.map(String).sort().join(",") : "";
      parts.push(key + ":" + file + "|" + css + "|" + imports);
    }

    return hashString(parts.join(";"));
  } catch (e) {
    return "1.0";
  }
}

function getHeader(req, headerName) {
  if (!req || !req.httpHeaders) {
    return undefined;
  }

  if (req.httpHeaders[headerName]) {
    return req.httpHeaders[headerName];
  }

  var lowerName = String(headerName).toLowerCase();
  if (req.httpHeaders[lowerName]) {
    return req.httpHeaders[lowerName];
  }

  var keys = Object.keys(req.httpHeaders);
  for (var i = 0; i < keys.length; i++) {
    if (String(keys[i]).toLowerCase() === lowerName) {
      return req.httpHeaders[keys[i]];
    }
  }

  return undefined;
}

function parseHeaderList(value) {
  if (!value) {
    return null;
  }

  return String(value)
    .split(",")
    .map(function (item) {
      return String(item).trim();
    })
    .filter(Boolean);
}

function isInertia(req) {
  var value = getHeader(req, Headers.Inertia);
  if (value === undefined || value === null) {
    return false;
  }
  if (value === true) {
    return true;
  }
  var str = String(value).toLowerCase();
  return str === "true" || str === "1";
}

function isPartialComponent(req) {
  return getHeader(req, Headers.PartialComponent);
}

function partialProps(req) {
  return parseHeaderList(getHeader(req, Headers.PartialOnly));
}

function exceptProps(req) {
  return parseHeaderList(getHeader(req, Headers.PartialExcept));
}

function inertiaVersion(req) {
  var version = getHeader(req, Headers.Version);
  return version ? String(version) : "";
}

function resetProps(req) {
  return parseHeaderList(getHeader(req, Headers.Reset)) || [];
}

function exceptOnceProps(req) {
  return parseHeaderList(getHeader(req, Headers.ExceptOnceProps)) || [];
}

function errorBag(req) {
  var bag = getHeader(req, Headers.ErrorBag);
  return bag ? String(bag) : "";
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
    Object.keys(obj).forEach(function (key) {
      // Recursively process the object
      obj[key] = processUrls(obj[key]);
    });
  } catch (e) {
    // Consider logging the error here for debugging
    var Logger = require("dw/system/Logger");
    Logger.error("Error processing object property: " + e.message);
    // Potentially rethrow the error or handle it more specifically
    return obj;
  }

  return obj;
}

function lazy(callback) {
  return {
    _isInertiaLazy: true,
    callback: callback,
  };
}

function defer(callback, group) {
  return {
    _isInertiaDefer: true,
    group: group || "default",
    callback: callback,
  };
}

function merge(value) {
  return {
    _isInertiaMerge: true,
    deep: false,
    value: value
  };
}

function deepMerge(value) {
  return {
    _isInertiaMerge: true,
    deep: true,
    value: value
  };
}

function scroll(value, wrapper, metadata) {
  return {
    _isInertiaScroll: true,
    value: value,
    wrapper: wrapper || "data",
    metadata: metadata || {}
  };
}

function once(value, expiresAt, key) {
  return {
    _isInertiaOnce: true,
    value: value,
    expiresAt: expiresAt === undefined ? null : expiresAt,
    key: key || null
  };
}

function buildScroll(data, handle) {
  handle = handle || {};

  var start = parseInt(handle.start, 10);
  var sz = parseInt(handle.sz, 10);
  var total = parseInt(handle.total, 10);

  start = Number.isFinite(start) && start >= 0 ? start : 0;
  sz = Number.isFinite(sz) && sz > 0 ? sz : 12;
  total = Number.isFinite(total) && total >= 0 ? total : 0;

  var nextStart = start + sz;
  var hasMore = nextStart < total;

  var next = hasMore ? nextStart : null;
  var previous = start - sz;
  previous = previous >= 0 ? previous : null;

  var value = {};
  value.data = data || [];
  value.pagination = {
    start: start,
    sz: sz,
    total: total,
    nextStart: next,
    hasMore: hasMore
  };

  return scroll(
    value,
    "data",
    {
      pageName: "start",
      previousPage: previous,
      nextPage: next,
      currentPage: start
    }
  );
}

module.exports = {
  Headers: Headers,
  getHeader: getHeader,
  assetsVersion: assetsVersion,
  inertiaVersion: inertiaVersion,
  errorBag: errorBag,
  isInertia: isInertia,
  isPartialComponent: isPartialComponent,
  partialProps: partialProps,
  exceptProps: exceptProps,
  resetProps: resetProps,
  exceptOnceProps: exceptOnceProps,
  processUrls: processUrls,
  lazy: lazy,
  defer: defer,
  merge: merge,
  deepMerge: deepMerge,
  scroll: scroll,
  once: once,
  buildScroll: buildScroll,
};
