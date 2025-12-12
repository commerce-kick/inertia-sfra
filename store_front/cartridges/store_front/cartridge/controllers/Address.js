const server = require("server");
server.extend(module.superModule);

const inertia = require("*/cartridge/scripts/middleware/inertiaMiddleware");

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
  inertia.shareData,
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
  inertia.shareData,
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
  inertia.shareData,
  inertia.render
);

module.exports = server.exports();
