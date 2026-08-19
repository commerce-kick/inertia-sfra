"use strict";

/**
 * @namespace Account
 */

const server = require("server");
server.extend(module.superModule);

const PageMgr = require("dw/experience/PageMgr");

server.get("Page", function (req, res, next) {

  const page = PageMgr.getPage('home');

  PageMgr.serializePage('homepage-example', req.pageMetaData);


  return next();

});


module.exports = server.exports();
