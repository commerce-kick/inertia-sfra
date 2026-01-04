"use strict";

var Headers = require("./Headers");
var Prop = require("./Prop");
var vite = require("*/cartridge/helpers/vite");

/**
 * Inertia Class
 * @param {Object} req - The SFRA request object
 * @param {Object} res - The SFRA response object
 */
function Inertia(req, res) {
  this.req = req;
  this.res = res;
  this.sharedProps = {};
  this.rootView = "components/layout/inertia";
  this.version = null;
  this._encryptHistory = false;
  this._clearHistory = false;
}

/**
 * Set the root view template
 * @param {String} view
 */
Inertia.prototype.setRootView = function (view) {
  this.rootView = view;
};

/**
 * Set the asset version
 * @param {String} version
 */
Inertia.prototype.setVersion = function (version) {
  this.version = version;
};

/**
 * Encrypt history
 * @param {Boolean} encrypt
 */
Inertia.prototype.encryptHistory = function (encrypt) {
  this._encryptHistory = encrypt;
};

/**
 * Clear history
 * @param {Boolean} clear
 */
Inertia.prototype.clearHistory = function (clear) {
  this._clearHistory = clear;
};

/**
 * Share data with the response
 * @param {String|Object} key
 * @param {Any} value
 */
Inertia.prototype.share = function (key, value) {
  if (typeof key === "object" && value === undefined) {
    Object.assign(this.sharedProps, key);
  } else {
    this.sharedProps[key] = value;
  }
};

/**
 * Create a lazy prop
 * @param {Function} callback
 */
Inertia.prototype.lazy = function (callback) {
  return new Prop.LazyProp(callback);
};

/**
 * Create an always prop
 * @param {Any} value
 */
Inertia.prototype.always = function (value) {
  return new Prop.AlwaysProp(value);
};

/**
 * Create a deferred prop
 * @param {Function} callback
 * @param {String} group
 */
Inertia.prototype.defer = function (callback, group) {
  return new Prop.DeferProp(callback, group);
};

/**
 * Create a scroll prop
 * @param {Function} callback
 */
Inertia.prototype.scroll = function (callback) {
  return new Prop.ScrollProp(callback);
};

/**
 * Create a merge prop
 * @param {Any} value
 */
Inertia.prototype.merge = function (value) {
  return new Prop.MergeProp(value);
};

/**
 * Create a deep merge prop
 * @param {Any} value
 */
Inertia.prototype.deepMerge = function (value) {
  return new Prop.MergeProp(value).deep();
};

/**
 * Create a prepend merge prop
 * @param {Any} value
 */
Inertia.prototype.prepend = function (value) {
  return new Prop.MergeProp(value).prepend();
};

/**
 * Create an optional prop
 * @param {Function} callback
 */
Inertia.prototype.optional = function (callback) {
  return new Prop.OptionalProp(callback);
};

/**
 * Internal: Resolve Flash Messages
 * @returns {Object}
 */
Inertia.prototype.resolveFlashMessages = function () {
  var flash = {};
  // Check for flash messages in session.custom (standard SFCC pattern could vary)
  // We assume a 'flash' object in session.custom
  if (session.custom && session.custom.flash) {
    try {
      flash = JSON.parse(session.custom.flash);
    } catch (e) {
      flash = session.custom.flash;
    }
    // Clear flash after reading
    session.custom.flash = null;
  }
  return flash;
};

/**
 * Create a paginator object for infinite scroll/pagination
 * @param {Array|dw.util.Collection} items - The items for the current page
 * @param {Number} total - Total number of items
 * @param {String} [baseUrl] - The route/pipeline name (e.g. 'Product-List'). Optional.
 * @param {Object} [options] - Options: start, size, params (extra query params)
 * @returns {Object} { data: [], links: {}, meta: {} }
 */
Inertia.prototype.createPaginator = function (items, total) {
  const queryString = this.req.querystring;

  var start = parseInt(queryString.start, 10);
  var sz = parseInt(queryString.sz, 10);

  start = Number.isFinite(start) && start >= 0 ? start : 0;
  sz = Number.isFinite(sz) && sz > 0 ? sz : 12;
  total = Number.isFinite(total) && total >= 0 ? total : 0;

  var nextStart = start + sz;
  var hasMore = nextStart < total;

  var next = hasMore ? nextStart : null;
  var previous = start - sz;
  previous = previous >= 0 ? previous : null;

  return {
    data: items,
    meta: {
      pageName: "start",
      previousPage: previous,
      nextPage: next,
      currentPage: start,
    },
  };
};

/**
 * Resolve current URL
 * @returns {String}
 */
Inertia.prototype.resolveUrl = function () {
  var viewData = this.res.getViewData();
  var queryObject = viewData.queryString;
  var action = viewData.action;

  function decodeQueryValue(value) {
    var result = String(value === undefined || value === null ? "" : value);
    for (var i = 0; i < 4; i++) {
      var decoded;
      try {
        decoded = decodeURIComponent(result.replace(/\+/g, " "));
      } catch (e) {
        return result;
      }
      if (decoded === result) {
        return result;
      }
      result = decoded;
    }
    return result;
  }

  var queryString =
    queryObject && typeof queryObject.toString === "function"
      ? queryObject.toString()
      : "";
  queryString = String(queryString || "");
  if (queryString.charAt(0) === "?") {
    queryString = queryString.slice(1);
  }

  var params = {};
  var orderedKeys = [];

  if (queryString) {
    queryString.split("&").forEach(function (pair) {
      if (!pair) {
        return;
      }

      var eqIndex = pair.indexOf("=");
      var key = eqIndex === -1 ? pair : pair.slice(0, eqIndex);
      var value = eqIndex === -1 ? "" : pair.slice(eqIndex + 1);

      if (!key) {
        return;
      }

      var decodedValue = decodeQueryValue(value);
      if (!Object.prototype.hasOwnProperty.call(params, key)) {
        orderedKeys.push(key);
      }
      params[key] = decodedValue;
    });
  }

  var urlArgs = [action];
  orderedKeys.forEach(function (key) {
    urlArgs.push(key);
    urlArgs.push(params[key]);
  });

  var finalSearchUrl = dw.web.URLUtils.url.apply(null, urlArgs).toString();

  return finalSearchUrl;
};

/**
 * Resolve component name (handle locale prefixes)
 * @param {String} component
 * @returns {String}
 */
Inertia.prototype.resolveComponent = function (component) {
  // simple check to avoid looking up if it already looks complete?
  // But we need to check manifest for locale-specific overrides.

  var locale = this.res.getViewData().locale;
  var manifest = {};
  try {
    manifest = require("*/cartridge/static/default/manifest.json");
  } catch (e) {
    // ignore
  }

  var localeComponent = locale + "/" + component;
  var localePath = "app/pages/" + localeComponent + ".tsx";

  if (manifest[localePath]) {
    return localeComponent;
  }

  return "default/" + component;
};

/**
 * Render the Inertia response
 * @param {String} component
 * @param {Object} props
 */
Inertia.prototype.render = function (component, props) {
  var res = this.res;
  var req = this.req;

  var resolvedComponent = this.resolveComponent(component);

  var httpHeaders = (req && req.httpHeaders) || request.httpHeaders;
  var httpMethod = (req && req.httpMethod) || request.httpMethod;
  var url = this.resolveUrl();

  var isInertiaRequest = !!httpHeaders[Headers.INERTIA_REQUEST];

  // Handle Asset Versioning
  if (
    isInertiaRequest &&
    httpMethod === "GET" &&
    this.version &&
    httpHeaders[Headers.VERSION_REQUEST] !== this.version
  ) {
    return this.location(url);
  }

  // Combine all props
  var flashProps = this.resolveFlashMessages();
  var allProps = Object.assign({}, this.sharedProps, props, flashProps);

  // Parse Headers
  var partialComponent = httpHeaders[Headers.PARTIAL_COMPONENT_REQUEST];
  var isPartial = isInertiaRequest && partialComponent === resolvedComponent;

  var only = [];
  var except = [];
  var reset = [];

  if (isPartial) {
    var onlyHeader = httpHeaders[Headers.PARTIAL_DATA_REQUEST];
    var exceptHeader = httpHeaders[Headers.PARTIAL_EXCEPT_REQUEST];
    if (onlyHeader) only = onlyHeader.split(",");
    if (exceptHeader) except = exceptHeader.split(",");
  }

  var resetHeader = httpHeaders[Headers.RESET];
  if (resetHeader) reset = resetHeader.split(",");

  // Resolve Properties
  var finalProps = {};

  // 1. Resolve Deferred Props Metadata
  var deferredProps = {};
  if (!isPartial) {
    var deferredGroups = {};
    for (var key in allProps) {
      var value = allProps[key];
      if (value instanceof Prop.DeferProp) {
        var group = value.group;
        if (!deferredGroups[group]) deferredGroups[group] = [];
        deferredGroups[group].push(key);
      }
    }
    if (Object.keys(deferredGroups).length > 0) {
      deferredProps = deferredGroups;
    }
  }

  // 2. Resolve Merge Props Metadata
  var mergeProps = [];
  var deepMergeProps = [];
  var prependProps = [];
  var scrollProps = {};

  for (var key in allProps) {
    var value = allProps[key];
    var isMergeable = false;
    var mergeProp = null;

    if (value instanceof Prop.MergeProp) {
      isMergeable = true;
      mergeProp = value;
    } else if (value instanceof Prop.DeferProp && value.shouldMerge) {
      isMergeable = true;
      mergeProp = value;
    } else if (value instanceof Prop.ScrollProp) {
      isMergeable = true;
      mergeProp = value;

      // Check merge intent for scroll props
      var mergeIntent = httpHeaders[Headers.INFINITE_SCROLL_MERGE_INTENT];
      if (mergeIntent === "prepend") {
        mergeProp.shouldPrepend = true;
        mergeProp.shouldAppend = false;
      } else {
        // Default append
        mergeProp.shouldPrepend = false;
        mergeProp.shouldAppend = true;
      }
    }

    if (isMergeable) {
      // Check if this prop should be reset (not merged)
      var shouldReset = reset.indexOf(key) !== -1;

      if (value instanceof Prop.ScrollProp) {
        // For ScrollProp, we need to resolve it early to get metadata
        // But typically Inertia V2 ScrollProp waits for execution.
        // However, to send 'scrollProps' metadata, we might need the paginator info.
        // In Laravel, 'scrollProps' metadata is sent.

        // We'll execute the callback to get the Paginator
        // Note: This makes ScrollProp eager-loaded on first load, which matches Laravel default
        // unless wrapped in lazy/defer.
        var resolvedValue =
          typeof value.value === "function" ? value.value() : value.value;
        value.resolved = resolvedValue; // Cache it

        // Extract metadata if it looks like our Paginator
        if (resolvedValue && resolvedValue.meta) {
          scrollProps[key] = {
            pageName: resolvedValue.meta.pageName, // SFCC uses 'start' not 'page'
            currentPage: resolvedValue.meta.current_start,
            previousPage: resolvedValue.meta.previousPage,
            nextPage: resolvedValue.meta.nextPage,
            reset: shouldReset,
          };
        }
      }

      if (!shouldReset) {
        if (mergeProp.shouldDeepMerge) {
          deepMergeProps.push(key);
        } else if (mergeProp.shouldPrepend) {
          prependProps.push(key);
        } else {
          mergeProps.push(key);
        }
      }
    }
  }

  // 3. Resolve Values
  for (var key in allProps) {
    var value = allProps[key];
    var isLazy = value instanceof Prop.LazyProp;
    var isAlways = value instanceof Prop.AlwaysProp;
    var isDefer = value instanceof Prop.DeferProp;
    var isOptional = value instanceof Prop.OptionalProp;
    var isMerge = value instanceof Prop.MergeProp;
    var isScroll = value instanceof Prop.ScrollProp;

    var include = false;

    if (isPartial) {
      if (isAlways) {
        include = true;
      } else if (only.length > 0) {
        include = only.indexOf(key) !== -1;
      } else if (except.length > 0) {
        include = except.indexOf(key) === -1;
      } else {
        include = true;
      }
    } else {
      // Full Load
      // Exclude IgnoreFirstLoad props (Lazy, Optional, Defer)
      if (!isLazy && !isOptional && !isDefer) {
        include = true;
      }
    }

    if (include) {
      // Unwrap
      if (isLazy || isOptional || isDefer) {
        finalProps[key] = value.callback();
      } else if (isAlways || isMerge) {
        var inner = value.value;
        if (typeof inner === "function") {
          finalProps[key] = inner();
        } else {
          finalProps[key] = inner;
        }
      } else if (isScroll) {
        // Use cached resolved value if available (from metadata step)
        if (value.resolved !== undefined) {
          // For scroll props, we typically want just the DATA array for the prop value
          // The metadata (links/total) goes into 'scrollProps'
          var data = value.resolved;
          if (data && data.data) {
            finalProps[key] = data.data;
          } else {
            finalProps[key] = data;
          }
        } else {
          // Should have been resolved
          var v =
            typeof value.value === "function" ? value.value() : value.value;
          if (v && v.data) finalProps[key] = v.data;
          else finalProps[key] = v;
        }
      } else if (typeof value === "function") {
        finalProps[key] = value();
      } else {
        finalProps[key] = value;
      }
    }
  }

  var page = {
    component: resolvedComponent,
    props: finalProps,
    url: url,
    version: this.version,
    encryptHistory: this._encryptHistory,
    clearHistory: this._clearHistory,
  };

  // Attach deferredProps if present
  if (Object.keys(deferredProps).length > 0) {
    page.deferredProps = deferredProps;
  }

  // Attach mergeProps if present
  if (mergeProps.length > 0) {
    page.mergeProps = mergeProps;
  }

  // Attach deepMergeProps if present
  if (deepMergeProps.length > 0) {
    page.deepMergeProps = deepMergeProps;
  }

  // Attach prependProps if present
  if (prependProps.length > 0) {
    page.prependProps = prependProps;
  }

  // Attach scrollProps if present
  if (Object.keys(scrollProps).length > 0) {
    page.scrollProps = scrollProps;
  }

  if (isInertiaRequest) {
    res.setHttpHeader(Headers.INERTIA, "true");
    res.setHttpHeader("Vary", Headers.INERTIA);

    if (this.version) {
      res.setHttpHeader(Headers.VERSION, this.version);
    }

    res.json(page);
  } else {
    // HTML Response
    var viteTags = vite([
      "app/app.tsx",
      "app/Pages/" + resolvedComponent + ".tsx",
    ]);

    res.render(this.rootView, {
      page: page,
      viteTags: viteTags,
      CurrentSession: session,
      CurrentRequest: request,
      CurrentCustomer: customer,
    });
  }
};

Inertia.prototype.location = function (url) {
  this.res.setStatusCode(409);
  this.res.setHttpHeader(Headers.LOCATION, url);
  this.res.json({});
};

module.exports = Inertia;
