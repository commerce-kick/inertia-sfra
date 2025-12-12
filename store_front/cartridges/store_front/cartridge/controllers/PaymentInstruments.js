const server = require("server");
server.extend(module.superModule);

const inertia = require("*/cartridge/scripts/middleware/inertiaMiddleware");

server.append(
  "AddPayment",
  function (req, res, next) {
    const viewData = res.getViewData();

    res.setViewData({
      template: "Account/AddPayment",
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
      template: "Account/PaymentList",
      props: viewData,
    });

    next();
  },
  inertia.shareData,
  inertia.render
);

module.exports = server.exports();
