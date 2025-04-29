'use strict';

var server = require('server');
server.extend(module.superModule);

server.append('DeleteAddress', function (req, res, next) {
    var CustomerMgr = require('dw/customer/CustomerMgr');
    var productListMgr = require('dw/customer/ProductListMgr');
    var Resource = require('dw/web/Resource');

    var addressId = req.querystring.addressId;
    var customer = CustomerMgr.getCustomerByCustomerNumber(req.currentCustomer.profile.customerNo);
    var addressBook = customer.getProfile().getAddressBook();
    var address = addressBook.getAddress(addressId);
    var matchingGiftRegistries = productListMgr.getProductLists(address);

    if (!matchingGiftRegistries.empty) {
        this.off('route:BeforeComplete');

        res.setStatusCode(500);
        res.json({
            errorMessage: Resource.msgf('error.msg.delete.address.linked.to.gift.registry', 'giftRegistry', null, addressId)
        });
    }

    next();
});

module.exports = server.exports();
