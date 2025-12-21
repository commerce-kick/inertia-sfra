"use strict";

var inertiaResponse = require("*/cartridge/helpers/http");
const utils = require("*/cartridge/helpers/utils");

var MUTATION_METHODS = ["PUT", "PATCH", "DELETE"];

function getRequestMethod(req) {
  return String(req.httpMethod || req.method || "").toUpperCase();
}

function render(req, res, next) {
  res.setViewData({
    inertia: true,
    version: utils.assetsVersion(),
  });

  const viewData = res.getViewData();
  var isInertiaRequest = utils.isInertia(req);
  var method = getRequestMethod(req);

  if (viewData.location) {
    if (isInertiaRequest) {
      res.setHttpHeader("Vary", utils.Headers.Inertia);
      res.setHttpHeader(utils.Headers.Location, String(viewData.location));

      if (typeof res.setStatusCode === "function") {
        res.setStatusCode(409);
      } else if (typeof res.setStatus === "function") {
        res.setStatus(409);
      }

      if (typeof res.print === "function") {
        res.print("");
      } else {
        res.json({});
      }

      return next();
    }

    if (typeof res.redirect === "function") {
      res.redirect(String(viewData.location));
    }
  }

  const props = viewData.props || {};
  const template = viewData.template;
  const sharedData = viewData.sharedData || {};

  if (!template) {
    if (
      isInertiaRequest &&
      MUTATION_METHODS.indexOf(method) !== -1 &&
      typeof res.getStatusCode === "function" &&
      res.getStatusCode() === 302
    ) {
      if (typeof res.setStatusCode === "function") {
        res.setStatusCode(303);
      } else if (typeof res.setStatus === "function") {
        res.setStatus(303);
      }
    }
    return next();
  }

  // Merge props with sharedData
  const mergedProps = Object.assign({}, sharedData, props);

  var response = inertiaResponse.render(
    req,
    template,
    mergedProps,
    viewData.action,
    viewData.locale,
    viewData.version,
    {
      clearHistory: !!viewData.clearHistory,
      encryptHistory: !!viewData.encryptHistory
    }
  );

  if (response.statusCode) {
    for (var headerName in response.headers) {
      res.setHttpHeader(headerName, response.headers[headerName]);
    }

    if (typeof res.setStatusCode === "function") {
      res.setStatusCode(response.statusCode);
    } else if (typeof res.setStatus === "function") {
      res.setStatus(response.statusCode);
    }

    if (typeof res.print === "function") {
      res.print(response.body || "");
    } else {
      res.json({});
    }
  } else if (response.json) {

    for (var header in response.headers) {
      res.setHttpHeader(header, response.headers[header]);
    }

    res.json(response.json);
  } else {
    res.setHttpHeader("Vary", utils.Headers.Inertia);

    res.render(response.page, response.data);
  }

  next();
}

module.exports = {
  render: render
};
