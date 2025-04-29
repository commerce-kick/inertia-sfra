'use strict';

var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');
var chai = require('chai');
var chaiSubset = require('chai-subset');
var cookieJar = request.jar();
chai.use(chaiSubset);

describe('Wishlist Remove product from wishlist with 1 product', function () {
    this.timeout(5000);
    var pid = '701644329402M';
    var pid2 = '701644351120M';

    beforeEach(function () {
        var myRequest = {
            url: config.baseUrl + '/Wishlist-AddProduct',
            method: 'POST',
            rejectUnauthorized: false,
            resolveWithFullResponse: true,
            jar: cookieJar,
            form: {
                pid: pid,
                optionId: null,
                optionVal: null
            },
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        };
        return request(myRequest)
            .then(function (response1) {
                assert.equal(response1.statusCode, 200);
            });
    });

    it('should be able to remove the last item in wishlist', function () {
        var myRequest2 = {
            url: config.baseUrl + '/Wishlist-RemoveProduct?pid=' + pid,
            method: 'GET',
            rejectUnauthorized: false,
            resolveWithFullResponse: true,
            jar: cookieJar,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        };
        return request(myRequest2)
            .then(function (response2) {
                assert.equal(response2.statusCode, 200);
                var bodyAsJson = JSON.parse(response2.body);
                assert.isTrue(bodyAsJson.success);
                assert.equal(bodyAsJson.action, 'Wishlist-RemoveProduct');
                assert.equal(bodyAsJson.queryString, 'pid=' + pid);
                assert.isTrue(bodyAsJson.listIsEmpty);
                assert.equal(bodyAsJson.emptyWishlistMsg, 'This list is empty.');
            });
    });
    describe('Wishlist Remove one of the items from wishlist', function () {
        before(function () {
            var myRequest3 = {
                url: config.baseUrl + '/Wishlist-AddProduct',
                method: 'POST',
                rejectUnauthorized: false,
                resolveWithFullResponse: true,
                jar: cookieJar,
                form: {
                    pid: pid2,
                    optionId: null,
                    optionVal: null
                },
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            };
            return request(myRequest3)
                .then(function (response3) {
                    assert.equal(response3.statusCode, 200);
                    var bodyAsJson3 = JSON.parse(response3.body);
                    assert.isTrue(bodyAsJson3.success);
                });
        });
        it('should remove one of the products from wishlist', function () {
            var myRequest4 = {
                url: config.baseUrl + '/Wishlist-RemoveProduct?pid=' + pid,
                method: 'GET',
                rejectUnauthorized: false,
                resolveWithFullResponse: true,
                jar: cookieJar,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            };
            return request(myRequest4)
                .then(function (response4) {
                    assert.equal(response4.statusCode, 200);
                    var bodyAsJson = JSON.parse(response4.body);
                    assert.isTrue(bodyAsJson.success);
                    assert.equal(bodyAsJson.action, 'Wishlist-RemoveProduct');
                    assert.equal(bodyAsJson.queryString, 'pid=' + pid);
                    assert.isFalse(bodyAsJson.listIsEmpty);
                    var myRequest5 = {
                        url: config.baseUrl + '/Wishlist-GetListJson',
                        method: 'GET',
                        rejectUnauthorized: false,
                        resolveWithFullResponse: true,
                        jar: cookieJar,
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest'
                        }
                    };
                    return request(myRequest5)
                        .then(function (response5) {
                            assert.equal(response5.statusCode, 200);
                            bodyAsJson = JSON.parse(response5.body);
                            assert.isTrue(bodyAsJson.success);
                            assert.isTrue(bodyAsJson.list.length === 1);
                            assert.equal(bodyAsJson.list.items[0].pid, pid2);
                        });
                });
        });
    });
});
