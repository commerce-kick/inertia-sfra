"use strict";

/**
 * @namespace Inertia
 */

var server = require("server");

var viteTags = require("*/cartridge/helpers/vite");

server.get("Head", function (req, res, next) {
  const page = req.querystring.component;
  const componet = `app/Pages/${page}.tsx`;

  const tags = viteTags(["app/app.tsx", componet]);

  res.render("components/inertia/head", {
    tags: tags,
  });

  next();
});

module.exports = server.exports();
