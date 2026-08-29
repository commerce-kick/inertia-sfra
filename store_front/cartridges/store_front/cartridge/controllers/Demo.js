"use strict";

/**
 * @namespace Account
 */

const server = require("server");

const PageMgr = require("dw/experience/PageMgr");

server.get("Show", function (req, res, next) {
const j = PageMgr.getPage("homepage-example");
  const page = PageMgr.serializePage("homepage-example");
  page;

  res.json(page);

  return next();

});


module.exports = server.exports();

