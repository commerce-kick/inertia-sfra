'use strict';

var server = require('server');
var productListHelper = require('*/cartridge/scripts/productList/productListHelpers');
server.extend(module.superModule);

server.prepend('CreateAccount', function (req, res, next) {
    var viewData = res.getViewData();
    var list = productListHelper.getList(req.currentCustomer.raw, { type: 10 });
    viewData.list = list;
    res.setViewData(viewData);
    next();
});

server.append('CreateAccount', function (req, res, next) {
    this.on('route:BeforeComplete', function (req, res) { // eslint-disable-line no-shadow
        var OrderMgr = require('dw/order/OrderMgr');
        var CustomerMgr = require('dw/customer/CustomerMgr');
        var viewData = res.getViewData();
        var listGuest = viewData.list;
        var order = OrderMgr.getOrder(viewData.orderID);
        if (viewData.success && order) {
            var orderEmail = order.customerEmail;
            var newCustomer = CustomerMgr.getCustomerByLogin(orderEmail);
            var listLoggedIn = productListHelper.getList(newCustomer, { type: 10 });
            productListHelper.mergelists(listLoggedIn, listGuest, req, { type: 10 });
        }
    });
    next();
});

module.exports = server.exports();
