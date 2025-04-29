'use strict';

var giftregistryHelpers = require('./helpers/giftregistryUtils');
var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');
var productListItemID = { value: null };
var cookieJar = request.jar();
var registryID = { value: null };
var myRequestAfter;
var addressID2 = 'postShippingTitle';
var addressID1 = 'preShippingTitle';

describe('GiftRegistry Remove List', function () {
    this.timeout(7000);
    before(giftregistryHelpers.createGiftRegistry.bind(null, cookieJar, registryID, productListItemID));

    after(function () {
        myRequestAfter.url = config.baseUrl + '/Address-DeleteAddress?addressId=' + addressID2 + '&isDefault=false';
        return request(myRequestAfter)
            .then(function (responseAfter2) {
                assert.equal(responseAfter2.statusCode, 200);
                myRequestAfter.url = config.baseUrl + '/Address-DeleteAddress?addressId=' + addressID1 + '&isDefault=true';
                return request(myRequestAfter);
            });
    });

    it('Check Rendered HTML is not null - RemoveList', function () {
        myRequestAfter = {
            url: config.baseUrl + '/GiftRegistry-RemoveList?id=' + registryID.value,
            method: 'GET',
            rejectUnauthorized: false,
            resolveWithFullResponse: true,
            jar: cookieJar,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        };
        return request(myRequestAfter)
            .then(function (responseAfter) {
                assert.equal(responseAfter.statusCode, 200);
                var bodyAsJsonRemove = JSON.parse(responseAfter.body);
                assert.isNotNull(bodyAsJsonRemove.renderHTML);
                assert.equal(bodyAsJsonRemove.listIsEmpty, '0');
            });
    });
});
