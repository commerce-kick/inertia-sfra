"use strict";

/**
 * @namespace Home
 */

const server = require("server");
server.extend(module.superModule);

var initInertia = require("*/cartridge/scripts/middleware/initInertia");
var shareData = require("*/cartridge/scripts/middleware/shareData");

server.replace("Show", initInertia.init, shareData, function (req, res, next) {
  // Render using the new API
  res.inertia.render("Home/Show", {});

  next();
});

server.get("Demo", initInertia.init, shareData, function (req, res, next) {
  var props = {
    user: { name: "John Doe" },
  };
  // Render using the new API
  res.inertia.render("Home/Demo", props);

  next();
});

module.exports = server.exports();
