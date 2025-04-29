'use strict';

var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');
var chai = require('chai');
var chaiSubset = require('chai-subset');
chai.use(chaiSubset);
var pid1 = '701644329402M';
var pid2 = '701644329396M';
var bodyAsJson;
describe('Wishlist EditProduct', function () {
    this.timeout(5000);

    it('should edit a product in the wishlist', function () {
        var cookieJar = request.jar();
        var myRequest = {
            url: config.baseUrl + '/Wishlist-AddProduct',
            method: 'POST',
            rejectUnauthorized: false,
            resolveWithFullResponse: true,
            jar: cookieJar,
            form: {
                pid: pid1,
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
                bodyAsJson = JSON.parse(response.body);
                var expectedResponse = {
                    'success': true,
                    'msg': 'The product has been added to your wishlist.'
                };
                assert.equal(true, expectedResponse.success);
                assert.equal(bodyAsJson.msg, expectedResponse.msg);
                var myRequest2 = {
                    url: config.baseUrl + '/Wishlist-GetListJson',
                    method: 'get',
                    rejectUnauthorized: false,
                    resolveWithFullResponse: true,
                    jar: cookieJar,
                    form: {},
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                };
                return request(myRequest2)
                    .then(function (response2) {
                        bodyAsJson = JSON.parse(response2.body);
                        assert.equal(bodyAsJson.list.items[0].pid, pid1);
                        var uuid = bodyAsJson.list.items[0].UUID;
                        var myRequest3 = {
                            url: config.baseUrl + '/Wishlist-EditProductListItem',
                            method: 'POST',
                            rejectUnauthorized: false,
                            resolveWithFullResponse: true,
                            jar: cookieJar,
                            form: {
                                pid: pid2,
                                uuid: uuid
                            },
                            headers: {
                                'X-Requested-With': 'XMLHttpRequest'
                            }
                        };
                        return request(myRequest3)
                            .then(function (response3) {
                                bodyAsJson = JSON.parse(response3.body);
                                assert.equal(bodyAsJson.success, true);
                                return request(myRequest2)
                                    .then(function (response4) {
                                        bodyAsJson = JSON.parse(response4.body);
                                        assert.equal(bodyAsJson.list.items[0].pid, pid2);
                                    });
                            });
                    });
            });
    });
});
