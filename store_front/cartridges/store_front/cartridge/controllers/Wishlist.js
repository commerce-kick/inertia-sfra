const server = require("server");
server.extend(module.superModule);

const sharedData = require("*/cartridge/scripts/middleware/sharedData");
const inertia = require("*/cartridge/scripts/middleware/inertiaMiddleware");

server.append("Show", function (req, res, next) {
  const viewData = res.getViewData();

  res.json(viewData);

  next();
});

module.exports = server.exports();
