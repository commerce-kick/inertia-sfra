'use strict';

var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');

describe('Wishlist: Get product variant in wishlist for edit', function () {
    this.timeout(45000);

    var variantPid1 = '701643421084M'; // 3/4 Sleeve V-Neck Top: icy mint, XS

    var cookieJar = request.jar();
    var myRequest = {
        url: '',
        method: 'POST',
        rejectUnauthorized: false,
        resolveWithFullResponse: true,
        jar: cookieJar,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    };

    var cookieString;

    before(function () {
        myRequest.url = config.baseUrl + '/Wishlist-AddProduct';
        myRequest.form = {
            pid: variantPid1,
            optionId: null,
            optionVal: null
        };

        return request(myRequest)
            .then(function (response) {
                assert.equal(response.statusCode, 200);

                cookieString = cookieJar.getCookieString(myRequest.url);
            });
    });

    it('should get information on the specified product', function () {
        myRequest.method = 'GET';
        myRequest.url = config.baseUrl + '/Wishlist-GetProduct?pid=' + variantPid1;

        var cookie = request.cookie(cookieString);
        cookieJar.setCookie(cookie, myRequest.url);

        return request(myRequest)
            .then(function (response) {
                assert.equal(response.statusCode, 200);

                var bodyAsJson = JSON.parse(response.body);

                assert.isNotNull(bodyAsJson.renderedTemplate);
                assert.isString(bodyAsJson.closeButtonText);
                assert.isString(bodyAsJson.enterDialogMessage);
            });
    });
});
