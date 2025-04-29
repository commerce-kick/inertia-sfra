"use strict";

var inertiaResponse = require("*/cartridge/helpers/http");
const utils = require("*/cartridge/helpers/utils");

function inertiaMiddleware(req, res, next) {
  res.setViewData({
    inertia: true,
    version: "1.0",
  });

  const viewData = res.getViewData();

  const props = viewData.props || {};
  const template = viewData.template;
  const sharedData = viewData.sharedData || {};

  if (!template) {
    return next();
  }

  // Merge props with sharedData
  const mergedProps = Object.assign({}, sharedData, props);

  const hasInertiaHeader = utils.isInertia(req);
  const partialComponent = utils.isPartialComponent(req);

  if (hasInertiaHeader) {
    res.setHttpHeader("Vary", "x-inertia");
    res.setHttpHeader("X-SF-CC-Inertia", "true");
    res.setHttpHeader("Content-Type", "application/json");

    if (partialComponent) {
      res.setHttpHeader("X-SF-CC-Inertia-Partial-Component", partialComponent);
    }
  }

  var response = inertiaResponse.render(
    req,
    template,
    mergedProps,
    viewData.action,
    viewData.locale
  );

  if (response.json) {
    res.json(response.json);
  } else {
    res.setHttpHeader("Vary", "x-sf-cc-inertia");
    res.setHttpHeader("X-SF-CC-Inertia", "true");

    res.render(response.page, response.data);
  }

  next();
}

module.exports = {
  inertiaMiddleware: inertiaMiddleware,
};
