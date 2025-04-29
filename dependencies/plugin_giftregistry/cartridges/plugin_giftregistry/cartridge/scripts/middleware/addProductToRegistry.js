'use strict';

/**
 * Adds an item to the gift registry
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next call in the middleware chain
 * @returns {void}
 */
function addToRegistry(req, res, next) {
    var productListHelper = require('*/cartridge/scripts/productList/productListHelpers');

    if (!req.querystring.args) {
        return next();
    }

    var args = JSON.parse(decodeURIComponent(req.querystring.args));

    var viewData = res.getViewData();
    var id = viewData.ID;
    var list = productListHelper.getList(req.currentCustomer.raw, { type: 11, id: id });

    var config = {
        qty: parseInt(args.qty, 10) || 1,
        optionId: args.optionId,
        optionValue: args.optionVal,
        req: req,
        type: 11
    };

    productListHelper.addItem(list, args.pid, config);

    return next();
}

module.exports = {
    addToRegistry: addToRegistry
};
