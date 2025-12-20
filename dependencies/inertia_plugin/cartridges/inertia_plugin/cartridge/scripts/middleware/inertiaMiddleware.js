"use strict";

var inertiaResponse = require("*/cartridge/helpers/http");
const utils = require("*/cartridge/helpers/utils");

function render(req, res, next) {
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

  var response = inertiaResponse.render(
    req,
    template,
    mergedProps,
    viewData.action,
    viewData.locale
  );

  if (response.json) {

    for (var header in response.headers) {
      res.setHttpHeader(header, response.headers[header]);
    }

    res.json(response.json);
  } else {
    res.setHttpHeader("Vary", "X-SF-CC-inertia");
    res.setHttpHeader("X-SF-CC-inertia", "true");

    res.render(response.page, response.data);
  }

  next();
}

module.exports = {
  render: render
};
