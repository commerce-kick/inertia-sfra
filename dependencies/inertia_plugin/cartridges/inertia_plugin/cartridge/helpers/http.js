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

  // Handle partial reloads
  if (utils.isPartialComponent(req) === component) {
    const only = utils.partialProps(req);
    if (only) {
      const partialProps = {};
      only.forEach((key) => {
        if (props[key]) {
          partialProps[key] = props[key];
        }
      });
      pageData.props = partialProps;
    }
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
        props: props,
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
