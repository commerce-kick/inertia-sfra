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

function generateURL(action, queryObject) {
  var urlArgs = [action];

  const and = queryObject.toString().split("&");

  and.forEach((el) => {
    const arr = el.split("=");
    urlArgs.push(arr[0]);
    urlArgs.push(arr[1]);
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

function render(req, component, props, action, locale) {
  var url = generateURL(action, req.querystring);
  const componentName = getComponentName(component, locale);

  var pageData = {
    component: componentName,
    props: props,
    url: url,
    version: "1.0",
  };

  // Resolve props (handling partial reloads and lazy props)
  const isPartial = utils.isPartialComponent(req) === componentName;
  const only = isPartial ? utils.partialProps(req) : null;
  const finalProps = {};
  const deferredProps = {};

  Object.keys(props).forEach(function(key) {
    var value = props[key];
    var isLazy = value && typeof value === 'object' && value._isInertiaLazy;
    var isDefer = value && typeof value === 'object' && value._isInertiaDefer;

    if (isPartial && only) {
      // Partial request: only include if key is in 'only' list
      if (only.indexOf(key) !== -1) {
        if (isLazy || isDefer) {
          finalProps[key] = value.callback();
        } else {
          finalProps[key] = value;
        }
      }
    } else {
      // Full request: include everything EXCEPT lazy props
      if (isDefer) {
        var group = value.group || "default";
        if (!deferredProps[group]) {
          deferredProps[group] = [];
        }
        deferredProps[group].push(key);
      } else if (!isLazy) {
        finalProps[key] = value;
      }
    }
  });

  pageData.props = finalProps;
  if (!isPartial && Object.keys(deferredProps).length > 0) {
    pageData.deferredProps = deferredProps;
  }

  if (utils.isInertia(req)) {
    return {
      json: pageData,
      headers: {
        Vary: "Accept",
        "X-SF-CC-Inertia": "true",
        "X-SF-CC-Inertia-Version": pageData.version,
        "X-SF-CC-Inertia-Location": pageData.url,
        "Content-Type": "application/json",
        "X-SF-CC-Inertia-Should-Redirect": "false",
      },
    };
  }

  if (isSSREnabled()) {
    const response = ssrService.callRestService(
      JSON.stringify({
        component: componentName,
        props: pageData.props,
        deferredProps: pageData.deferredProps,
        url: url,
        version: "1.0",
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
