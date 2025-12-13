const server = require("server");
server.extend(module.superModule);

const inertia = require("*/cartridge/scripts/middleware/inertiaMiddleware");

server.append(
  "Start",
  function (req, res, next) {
    const viewData = res.getViewData();

    res.redirect(dw.web.URLUtils.url("Home-Show"));

    next();
  },
  inertia.sharedData,
  inertia.render
);

module.exports = server.exports();
