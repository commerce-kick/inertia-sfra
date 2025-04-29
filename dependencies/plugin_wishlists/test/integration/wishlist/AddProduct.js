'use strict';

var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');
var chai = require('chai');
var chaiSubset = require('chai-subset');
chai.use(chaiSubset);

describe('Wishlist AddProduct', function () {
    this.timeout(5000);

    it('should add product to wishlist', function () {
        var cookieJar = request.jar();
        var myRequest = {
            url: config.baseUrl + '/Wishlist-AddProduct',
            method: 'POST',
            rejectUnauthorized: false,
            resolveWithFullResponse: true,
            jar: cookieJar,
            form: {
                pid: '701644329402M',
                optionId: null,
                optionVal: null
            },
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        };

        return request(myRequest)
            .then(function (response) {
                assert.equal(response.statusCode, 200);
                var bodyAsJson = JSON.parse(response.body);
                var expectedResponse = {
                    'success': true,
                    'msg': 'The product has been added to your wishlist.'
                };
                assert.equal(true, expectedResponse.success);
                assert.equal(bodyAsJson.msg, expectedResponse.msg);
            });
    });

    it('should not add product to wishlist a second time', function () {
        var cookieJar = request.jar();
        var myRequest = {
            url: config.baseUrl + '/Wishlist-AddProduct',
            method: 'POST',
            rejectUnauthorized: false,
            resolveWithFullResponse: true,
            jar: cookieJar,
            form: {
                pid: '701644329402M',
                optionId: null,
                optionVal: null
            },
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        };

        return request(myRequest)
            .then(function () {
                var myRequest2 = {
                    url: config.baseUrl + '/Wishlist-AddProduct',
                    method: 'POST',
                    rejectUnauthorized: false,
                    resolveWithFullResponse: true,
                    jar: cookieJar,
                    form: {
                        pid: '701644329402M',
                        optionId: null,
                        optionVal: null
                    },
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                };
                return request(myRequest2)
                    .then(function (response2) {
                        assert.equal(response2.statusCode, 200);
                        var bodyAsJson = JSON.parse(response2.body);
                        var expectedResponse = {
                            'error': true,
                            'msg': 'The product is already in the wishlist and will not be added again.'
                        };
                        assert.equal(true, expectedResponse.error);
                        assert.equal(bodyAsJson.msg, expectedResponse.msg);
                    });
            });
    });

    it('should fail adding product to wishlist if pid is bogus', function () {
        var cookieJar = request.jar();
        var myRequest = {
            url: config.baseUrl + '/Wishlist-AddProduct',
            method: 'POST',
            rejectUnauthorized: false,
            resolveWithFullResponse: true,
            jar: cookieJar,
            form: {
                pid: '70164432940',
                optionId: null,
                optionVal: null
            },
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        };
        return request(myRequest)
            .then(function (response) {
                assert.equal(response.statusCode, 500, 'Expected add wishlist call to fail when pid is incorrect.');
            })
            .catch(function (error) {
                assert.equal(error.statusCode, 500, 'Expected statusCode to be 500 for add to wishlist with bogus pid.');
                var bodyAsJson = JSON.parse(error.response.body);
                assert.equal(
                    bodyAsJson.message,
                    'For technical reasons, your request could not be handled properly at this time. We apologize for any inconvenience.',
                    'Actual error message from add to wishlist with non-matching pid not as expected'
                );
            });
    });
});
