'use strict';

var Inertia = require('*/cartridge/scripts/inertia/Inertia');


function hashString(str) {
  var hash = 5381;
  var input = String(str || "");
  for (var i = 0; i < input.length; i++) {
    hash = (hash << 5) + hash + input.charCodeAt(i);
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
      var css = Array.isArray(entry.css)
        ? entry.css.map(String).sort().join(",")
        : "";
      var imports = Array.isArray(entry.imports)
        ? entry.imports.map(String).sort().join(",")
        : "";
      parts.push(key + ":" + file + "|" + css + "|" + imports);
    }

    return hashString(parts.join(";"));
  } catch (e) {
    return "1.0";
  }
}

/**
 * Middleware to initialize Inertia
 */
function init(req, res, next) {
    // Initialize Inertia instance
    var inertia = new Inertia(req, res);
    
    // Set version
    inertia.setVersion(assetsVersion());

    // Attach to res for access in controllers
    res.inertia = inertia;

    next();
}

module.exports = {
    init: init
};
