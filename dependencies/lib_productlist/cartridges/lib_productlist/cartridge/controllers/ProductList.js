'use strict';

var server = require('server');
var productListHelper = require('*/cartridge/scripts/productList/productListHelpers');

server.post('TogglePublic', function (req, res, next) {
    var currentCustomer = req.currentCustomer.raw;
    var list = productListHelper.getList(req.currentCustomer.raw, { type: parseInt(req.querystring.type, 10), id: req.querystring.ID });
    var itemID = req.form.itemID;
    var listID = req.form.listID || list.ID;
    var result = productListHelper.toggleStatus(currentCustomer, itemID, listID);
    res.json(result);
    next();
});

module.exports = server.exports();
