'use strict';

var giftregistryHelpers = require('./helpers/giftregistryUtils');
var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');
var productListItemID = { value: null };
var cookieJar = request.jar();
var registryID = { value: null };

describe('GiftRegistry Remove Product', function () {
    this.timeout(7000);
    before(giftregistryHelpers.createGiftRegistry.bind(null, cookieJar, registryID, productListItemID));

    after(giftregistryHelpers.removeGiftRegistry.bind(null, cookieJar, registryID));

    it('should remove a Product from the gift registry GiftRegistry - RemoveProduct', function () {
        var pid = '701644391737M';
        var myRequest2 = {
            url: '',
            method: 'GET',
            rejectUnauthorized: false,
            resolveWithFullResponse: true,
            jar: cookieJar,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        };
        var giftRegistryEndpoint = '/GiftRegistry-RemoveProduct';
        var queryString = '?pid=' + pid + '&id=' + registryID.value + '&UUID=' + productListItemID.value;
        myRequest2.url = config.baseUrl + giftRegistryEndpoint + queryString;

        return request(myRequest2)
            .then(function (response2) {
                assert.equal(response2.statusCode, 200);
                var bodyAsJsonRemove = JSON.parse(response2.body);
                assert.isTrue(bodyAsJsonRemove.success);
                assert.equal(productListItemID.value, bodyAsJsonRemove.UUID);
                assert.isTrue(bodyAsJsonRemove.listIsEmpty);
            });
    });
});
