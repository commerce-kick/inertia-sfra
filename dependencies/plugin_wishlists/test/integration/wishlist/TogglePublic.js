'use strict';

var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');

describe('TogglePublic', function () {
    this.timeout(25000);

    var cookieJar = request.jar();
    var cookieString;
    var cookie;
    var listID;
    var itemID;
    before(function () {
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

        myRequest.url = config.baseUrl + '/Wishlist-AddProduct';
        myRequest.form = {
            pid: '701644329402M',
            optionId: null,
            optionVal: null
        };
        return request(myRequest)
            .then(function (response) {
                assert.equal(response.statusCode, 200, 'Expected statusCode to be 200.');
                var bodyAsJson = JSON.parse(response.body);
                assert.equal(bodyAsJson.msg, 'The product has been added to your wishlist.');
                assert.isTrue(bodyAsJson.success);
                assert.equal(bodyAsJson.action, 'Wishlist-AddProduct');
            })
            .then(function () {
                myRequest.method = 'POST';
                myRequest.url = config.baseUrl + '/CSRF-Generate';
                return request(myRequest);
            })
            .then(function (csrfResponse) {
                var csrfJsonResponse = JSON.parse(csrfResponse.body);
                myRequest.method = 'POST';
                var csrfToken = csrfJsonResponse.csrf.token;
                myRequest.url = config.baseUrl + '/Account-Login?' + csrfJsonResponse.csrf.tokenName + '=' + csrfToken;

                myRequest.form = {
                    loginEmail: 'testUser1@demandware.com',
                    loginPassword: 'Test123!',
                    csrf_token: csrfJsonResponse.csrf.token
                };
                return request(myRequest)
                    .then(function (response) {
                        var parsedResponse = JSON.parse(response.body);
                        assert.isTrue(parsedResponse.success, 200);
                        cookieString = cookieJar.getCookieString(myRequest.url);
                        cookie = request.cookie(cookieString);
                        cookieJar.setCookie(cookie, myRequest.url);
                        myRequest = {
                            url: config.baseUrl + '/Wishlist-GetListJson',
                            method: 'get',
                            rejectUnauthorized: false,
                            resolveWithFullResponse: true,
                            jar: cookieJar,
                            headers: {
                                'X-Requested-With': 'XMLHttpRequest'
                            }
                        };
                        return request(myRequest)
                            .then(function (getListResponse) {
                                var bodyAsJson = JSON.parse(getListResponse.body);
                                assert.equal(getListResponse.statusCode, 200, 'Expected statusCode to be 200.');
                                listID = bodyAsJson.list.UUID;
                                itemID = bodyAsJson.list.items[0].id;
                            });
                    });
            });
    });
    it('should return a public list when toggle public for wishlist as a login user ', function () {
        var myRequest = {
            url: config.baseUrl + '/ProductList-TogglePublic',
            method: 'POST',
            rejectUnauthorized: false,
            resolveWithFullResponse: true,
            jar: cookieJar,
            form: {
                listID: listID,
                itemID: null
            },
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        };
        return request(myRequest)
            .then(function (togglePublicResponse) {
                var bodyAsJson = JSON.parse(togglePublicResponse.body);
                assert.equal(togglePublicResponse.statusCode, 200, 'Expected statusCode to be 200.');
                assert.isTrue(bodyAsJson.success);
                assert.equal(bodyAsJson.msg, 'The status of this list has been updated.');
                assert.equal(bodyAsJson.action, 'ProductList-TogglePublic');
                myRequest = {
                    url: config.baseUrl + '/Wishlist-GetListJson',
                    method: 'get',
                    rejectUnauthorized: false,
                    resolveWithFullResponse: true,
                    jar: cookieJar,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                };
                return request(myRequest);
            })
            .then(function (responseJSON) {
                assert.equal(responseJSON.statusCode, 200);
                var bodyAsJson = JSON.parse(responseJSON.body);
                assert.equal(bodyAsJson.list.publicList, true);
            });
    });
    it('should return a private list when toggle public for wishlist as a login user ', function () {
        var myRequest = {
            url: config.baseUrl + '/ProductList-TogglePublic',
            method: 'POST',
            rejectUnauthorized: false,
            resolveWithFullResponse: true,
            jar: cookieJar,
            form: {
                listID: listID,
                itemID: null
            },
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        };
        return request(myRequest)
            .then(function (togglePublicResponse) {
                var bodyAsJson = JSON.parse(togglePublicResponse.body);
                assert.equal(togglePublicResponse.statusCode, 200, 'Expected statusCode to be 200.');
                assert.isTrue(bodyAsJson.success);
                assert.equal(bodyAsJson.msg, 'The status of this list has been updated.');
                assert.equal(bodyAsJson.action, 'ProductList-TogglePublic');
                myRequest = {
                    url: config.baseUrl + '/Wishlist-GetListJson',
                    method: 'get',
                    rejectUnauthorized: false,
                    resolveWithFullResponse: true,
                    jar: cookieJar,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                };
                return request(myRequest);
            })
            .then(function (responseJSON) {
                assert.equal(responseJSON.statusCode, 200);
                var bodyAsJson = JSON.parse(responseJSON.body);
                assert.equal(bodyAsJson.list.publicList, false);
            });
    });
    it('should toggle an item in the wishlist from public to private when the listID and itemID are passed in', function () {
        var myRequest = {
            url: config.baseUrl + '/ProductList-TogglePublic',
            method: 'POST',
            rejectUnauthorized: false,
            resolveWithFullResponse: true,
            jar: cookieJar,
            form: {
                listID: listID,
                itemID: itemID
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
                    'msg': 'The status of this item has been updated.'
                };
                assert.equal(true, expectedResponse.success);
                assert.equal(bodyAsJson.msg, expectedResponse.msg);
                var requestJSON = {
                    url: config.baseUrl + '/Wishlist-GetListJson',
                    method: 'get',
                    rejectUnauthorized: false,
                    resolveWithFullResponse: true,
                    jar: cookieJar,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                };
                return request(requestJSON)
                    .then(function (responseJSON) {
                        bodyAsJson = JSON.parse(responseJSON.body);
                        assert.equal(bodyAsJson.list.items[0].publicItem, false);
                    });
            });
    });
    it('should toggle an item in the wishlist from private to public when the listID and itemID are passed in', function () {
        var myRequest = {
            url: config.baseUrl + '/ProductList-TogglePublic',
            method: 'POST',
            rejectUnauthorized: false,
            resolveWithFullResponse: true,
            jar: cookieJar,
            form: {
                listID: listID,
                itemID: itemID
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
                    'msg': 'The status of this item has been updated.'
                };
                assert.equal(true, expectedResponse.success);
                assert.equal(bodyAsJson.msg, expectedResponse.msg);
                var requestJSON = {
                    url: config.baseUrl + '/Wishlist-GetListJson',
                    method: 'get',
                    rejectUnauthorized: false,
                    resolveWithFullResponse: true,
                    jar: cookieJar,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                };
                return request(requestJSON)
                    .then(function (responseJSON) {
                        bodyAsJson = JSON.parse(responseJSON.body);
                        assert.equal(bodyAsJson.list.items[0].publicItem, true);
                    });
            });
    });
    after(function () {
        var myRequest = {
            url: config.baseUrl + '/Wishlist-RemoveList',
            method: 'get',
            rejectUnauthorized: false,
            resolveWithFullResponse: true,
            jar: cookieJar,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        };
        return request(myRequest);
    });
});
