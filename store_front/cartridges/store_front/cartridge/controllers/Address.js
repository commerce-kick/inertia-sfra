const server = require("server");
server.extend(module.superModule);

const inertia = require("*/cartridge/scripts/middleware/inertiaMiddleware");
const sharedData = require("*/cartridge/scripts/middleware/shareData");

server.append(
  "AddAddress",
  function (req, res, next) {
    const viewData = res.getViewData();

    res.setViewData({
      template: "Account/AddAddress",
      props: viewData,
    });

    next();
  },
  sharedData,
  inertia.render
);

server.append(
  "EditAddress",
  function (req, res, next) {
    const viewData = res.getViewData();

    res.setViewData({
      template: "Account/EditAddress",
      props: viewData,
    });

    next();
  },
  sharedData,
  inertia.render
);

server.append(
  "List",
  function (req, res, next) {
    const viewData = res.getViewData();

    res.setViewData({
      template: "Account/AddressList",
      props: viewData,
    });

    next();
  },
  sharedData,
  inertia.render
);

module.exports = server.exports();
