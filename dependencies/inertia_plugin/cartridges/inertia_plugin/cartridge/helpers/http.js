"use strict";

const utils = require("*/cartridge/helpers/utils");
const ssrService = require("*/cartridge/scripts/services/inertiaSsr");

function isSSREnabled() {
  var Site = require("dw/system/Site").getCurrent();
  var isEnabled = Site.getCustomPreferenceValue("inertia_ssr");
  return isEnabled;
}

function isRuleBasedURLsEnabled() {
  var Site = require("dw/system/Site").getCurrent();
  var isEnabled = Site.getCustomPreferenceValue("storefront_urls");
  return isEnabled;
}

function generateURL(action, reqOrQueryObject) {
  var queryObject = reqOrQueryObject && reqOrQueryObject.querystring ? reqOrQueryObject.querystring : reqOrQueryObject;

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

  var queryString = queryObject && typeof queryObject.toString === "function" ? queryObject.toString() : "";
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
}

function getComponentName(component, locale) {
  const manifest = require("*/cartridge/static/default/manifest.json") || {};

  const file = manifest[`app/pages/${locale}/${component}.tsx`];

  if (file) {
    return `${locale}/${component}`;
  }

  return `default/${component}`;
}

function getRequestMethod(req) {
  return String(req.httpMethod || req.method || "").toUpperCase();
}

function getByPath(obj, path) {
  if (!path) {
    return obj;
  }

  var parts = String(path).split(".");
  var current = obj;

  for (var i = 0; i < parts.length; i++) {
    if (current === null || current === undefined) {
      return undefined;
    }

    current = current[parts[i]];
  }

  return current;
}

function setByPath(obj, path, value) {
  var parts = String(path).split(".");
  var current = obj;

  if (value === undefined) {
    value = null;
  }

  for (var i = 0; i < parts.length; i++) {
    var key = parts[i];
    var isLast = i === parts.length - 1;

    if (isLast) {
      current[key] = value;
      return;
    }

    if (!current[key] || typeof current[key] !== "object") {
      current[key] = {};
    }

    current = current[key];
  }
}

function unsetByPath(obj, path) {
  var parts = String(path).split(".");
  var current = obj;

  for (var i = 0; i < parts.length; i++) {
    if (current === null || current === undefined) {
      return;
    }

    var key = parts[i];
    var isLast = i === parts.length - 1;

    if (isLast) {
      delete current[key];
      return;
    }

    current = current[key];
  }
}

function resolveCallableProp(value) {
  var isLazy = value && typeof value === "object" && value._isInertiaLazy;
  var isDefer = value && typeof value === "object" && value._isInertiaDefer;

  if (isLazy || isDefer) {
    return value.callback();
  }

  return value;
}

function resolvePropForResponse(key, prop, excludedOnceKeys, meta, scrollMergeIntent) {
  if (!prop || typeof prop !== "object") {
    return { skip: false, value: prop };
  }

  if (prop._isInertiaOnce) {
    var onceKey = prop.key || key;
    if (excludedOnceKeys && excludedOnceKeys.indexOf(onceKey) !== -1) {
      return { skip: true };
    }

    if (!meta.onceProps) {
      meta.onceProps = {};
    }
    meta.onceProps[onceKey] = {
      prop: key,
      expiresAt: prop.expiresAt === undefined ? null : prop.expiresAt
    };

    return { skip: false, value: resolveCallableProp(prop.value) };
  }

  if (prop._isInertiaScroll) {
    var wrapper = prop.wrapper || "data";

    if (!meta.scrollProps) {
      meta.scrollProps = {};
    }
    meta.scrollProps[key] = {
      wrapper: wrapper,
      metadata: prop.metadata || {}
    };

    var mergePath = key + "." + wrapper;

    if (scrollMergeIntent === "prepend") {
      if (!meta.prependKeys) {
        meta.prependKeys = [];
      }
      meta.prependKeys.push(mergePath);
    } else {
      if (!meta.mergeableKeys) {
        meta.mergeableKeys = [];
      }
      meta.mergeableKeys.push(mergePath);
    }

    return { skip: false, value: resolveCallableProp(prop.value) };
  }

  if (prop._isInertiaMerge) {
    if (prop.deep) {
      if (!meta.deepMergeKeys) {
        meta.deepMergeKeys = [];
      }
      meta.deepMergeKeys.push(key);
    } else {
      if (!meta.mergeableKeys) {
        meta.mergeableKeys = [];
      }
      meta.mergeableKeys.push(key);
    }

    return { skip: false, value: resolveCallableProp(prop.value) };
  }

  return { skip: false, value: resolveCallableProp(prop) };
}

function finalizeMeta(meta, finalProps, resetKeys) {
  var keys = Object.keys(finalProps || {});

  if (meta.mergeableKeys && meta.mergeableKeys.length) {
    meta.mergeProps = meta.mergeableKeys
      .filter(function (k) {
        var root = String(k).split(".")[0];
        return keys.indexOf(root) !== -1 && resetKeys.indexOf(root) === -1;
      })
      .filter(function (k, idx, arr) {
        return arr.indexOf(k) === idx;
      });
  }

  if (meta.prependKeys && meta.prependKeys.length) {
    meta.prependProps = meta.prependKeys
      .filter(function (k) {
        var root = String(k).split(".")[0];
        return keys.indexOf(root) !== -1 && resetKeys.indexOf(root) === -1;
      })
      .filter(function (k, idx, arr) {
        return arr.indexOf(k) === idx;
      });
  }

  if (meta.deepMergeKeys && meta.deepMergeKeys.length) {
    meta.deepMergeProps = meta.deepMergeKeys
      .filter(function (k) {
        var root = String(k).split(".")[0];
        return keys.indexOf(root) !== -1 && resetKeys.indexOf(root) === -1;
      })
      .filter(function (k, idx, arr) {
        return arr.indexOf(k) === idx;
      });
  }

  if (meta.scrollProps) {
    var scroll = {};
    Object.keys(meta.scrollProps).forEach(function (key) {
      if (keys.indexOf(key) === -1) {
        return;
      }
      var item = meta.scrollProps[key];
      scroll[key] = Object.assign({}, item.metadata, {
        wrapper: item.wrapper,
        reset: resetKeys.indexOf(key) !== -1
      });
    });
    meta.scrollProps = scroll;
  }

  if (meta.onceProps) {
    var once = {};
    Object.keys(meta.onceProps).forEach(function (onceKey) {
      var record = meta.onceProps[onceKey];
      var root = String(record.prop).split(".")[0];
      if (keys.indexOf(root) === -1) {
        return;
      }
      once[onceKey] = record;
    });
    meta.onceProps = once;
  }

  if (meta.mergeProps && meta.mergeProps.length === 0) {
    delete meta.mergeProps;
  }
  if (meta.prependProps && meta.prependProps.length === 0) {
    delete meta.prependProps;
  }
  if (meta.deepMergeProps && meta.deepMergeProps.length === 0) {
    delete meta.deepMergeProps;
  }
  if (meta.scrollProps && Object.keys(meta.scrollProps).length === 0) {
    delete meta.scrollProps;
  }
  if (meta.onceProps && Object.keys(meta.onceProps).length === 0) {
    delete meta.onceProps;
  }

  delete meta.mergeableKeys;
  delete meta.prependKeys;
  delete meta.deepMergeKeys;
}

function render(req, component, props, action, locale, version, options) {
  var url;
  if (req && req.httpURL && typeof req.httpURL.toString === "function") {
    var absoluteUrl = String(req.httpURL.toString());
    url = absoluteUrl.replace(/^[a-zA-Z]+:\/\/[^/]+/, "");
  } else {
    url = generateURL(action, req);
  }
  const componentName = getComponentName(component, locale);

  options = options || {};

  var pageData = {
    component: componentName,
    props: props,
    url: url,
    version: String(version || "1.0")
  };

  if (options.clearHistory) {
    pageData.clearHistory = true;
  }
  if (options.encryptHistory) {
    pageData.encryptHistory = true;
  }

  var isPartialComponent = utils.isPartialComponent(req) === componentName;
  var only = isPartialComponent ? utils.partialProps(req) : null;
  var except = isPartialComponent ? utils.exceptProps(req) : null;
  var isPartial = isPartialComponent && ((only && only.length) || (except && except.length));
  var resetKeys = utils.resetProps(req);
  var excludedOnceKeys = utils.exceptOnceProps(req);
  var errorBagName = utils.errorBag(req);
  var scrollMergeIntent = utils.getHeader(req, utils.Headers.InfiniteScrollMergeIntent);
  var meta = {};

  var finalProps = {};
  var deferredProps = {};

  if (isPartial && only && only.length) {
    only.forEach(function (path) {
      var rootKey = String(path).split(".")[0];
      var result = resolvePropForResponse(
        rootKey,
        props[rootKey],
        excludedOnceKeys,
        meta,
        scrollMergeIntent
      );
      if (result.skip) {
        return;
      }
      var resolvedRoot = result.value;

      if (String(path).indexOf(".") === -1) {
        finalProps[rootKey] = resolvedRoot === undefined ? null : resolvedRoot;
        return;
      }

      var nestedValue = getByPath(resolvedRoot, String(path).split(".").slice(1).join("."));
      setByPath(finalProps, path, nestedValue);
    });
  } else if (isPartial) {
    Object.keys(props).forEach(function (key) {
      var value = props[key];
      var isDefer = value && typeof value === "object" && value._isInertiaDefer;
      if (isDefer) {
        return;
      }

      var result = resolvePropForResponse(key, props[key], excludedOnceKeys, meta, scrollMergeIntent);
      if (result.skip) {
        return;
      }
      finalProps[key] = result.value;
    });

    if (except && except.length) {
      except.forEach(function (path) {
        unsetByPath(finalProps, path);
      });
    }
  } else {
    Object.keys(props).forEach(function (key) {
      var value = props[key];
      var isLazy = value && typeof value === "object" && value._isInertiaLazy;
      var isDefer = value && typeof value === "object" && value._isInertiaDefer;

      if (isDefer) {
        var group = value.group || "default";
        if (!deferredProps[group]) {
          deferredProps[group] = [];
        }
        deferredProps[group].push(key);
        return;
      }

      if (!isLazy) {
        var result = resolvePropForResponse(key, value, excludedOnceKeys, meta, scrollMergeIntent);
        if (result.skip) {
          return;
        }
        finalProps[key] = result.value;
      }
    });

    if (Object.keys(deferredProps).length > 0) {
      pageData.deferredProps = deferredProps;
    }
  }

  if (
    errorBagName &&
    finalProps &&
    typeof finalProps === "object" &&
    finalProps.errors &&
    typeof finalProps.errors === "object" &&
    !Array.isArray(finalProps.errors) &&
    finalProps.errors[errorBagName]
  ) {
    finalProps.errors = finalProps.errors[errorBagName];
  }

  pageData.props = utils.processUrls(finalProps);
  finalizeMeta(meta, pageData.props, resetKeys);

  if (meta.mergeProps) {
    pageData.mergeProps = meta.mergeProps;
  }
  if (meta.prependProps) {
    pageData.prependProps = meta.prependProps;
  }
  if (meta.deepMergeProps) {
    pageData.deepMergeProps = meta.deepMergeProps;
  }
  if (meta.scrollProps) {
    pageData.scrollProps = meta.scrollProps;
  }
  if (meta.onceProps) {
    pageData.onceProps = meta.onceProps;
  }

  if (utils.isInertia(req)) {
    var method = getRequestMethod(req);
    var clientVersion = utils.inertiaVersion(req);

    if (method === "GET" && clientVersion && clientVersion !== pageData.version) {
      var versionMismatchHeaders = {
        Vary: utils.Headers.Inertia,
        "Content-Type": "text/plain"
      };
      versionMismatchHeaders[utils.Headers.Location] = pageData.url;

      return {
        statusCode: 409,
        headers: versionMismatchHeaders,
        body: ""
      };
    }

    var inertiaHeaders = {
      Vary: utils.Headers.Inertia,
      "Content-Type": "application/json"
    };
    inertiaHeaders[utils.Headers.Inertia] = "true";
    inertiaHeaders[utils.Headers.Version] = pageData.version;

    return {
      json: pageData,
      headers: inertiaHeaders
    };
  }

  if (isSSREnabled()) {
    const response = ssrService.callRestService(
      JSON.stringify({
        component: componentName,
        props: pageData.props,
        deferredProps: pageData.deferredProps,
        url: url,
        version: pageData.version,
      })
    );

    return {
      page: "components/layout/ssr",
      data: {
        page: pageData,
        html: response.object,
      },
    };
  }

  return {
    page: "components/layout/inertia",
    data: {
      page: pageData,
    },
  };
}

module.exports = {
  render: render,
};
