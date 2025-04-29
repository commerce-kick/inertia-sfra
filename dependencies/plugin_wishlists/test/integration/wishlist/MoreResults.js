'use strict';

var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');

describe('Wishlist MoreResults', function () {
    this.timeout(60000);

    var cookieJar = request.jar();

    // Notice that for users used in this test, their wishlist are empty and private be default (as created by demo data).
    // Therefore any change in this regard have to be reverted/cleanup at the end of test.

    function setRequestUrlAndMethod(inRequest, endPoint, method) {
        var myRequest = inRequest;
        myRequest.url = config.baseUrl + '/' + endPoint;
        myRequest.method = method;
    }

    function setRequestToLogin(inRequest, csrfResponse, loginEmail, loginPassword) {
        var csrfJsonResponse = JSON.parse(csrfResponse.body);
        var csrfToken = csrfJsonResponse.csrf.token;

        var myRequest = inRequest;
        myRequest.url = config.baseUrl + '/Account-Login?' + csrfJsonResponse.csrf.tokenName + '=' + csrfToken;
        myRequest.method = 'POST';
        myRequest.form = {
            loginEmail: loginEmail,
            loginPassword: loginPassword,
            csrf_token: csrfToken
        };
    }

    function setCookieJar(inRequest, myCookieJar) {
        var myRequest = inRequest;
        var cookieString = cookieJar.getCookieString(myRequest.url);
        var cookie = request.cookie(cookieString);
        myCookieJar.setCookie(cookie, myRequest.url);
    }

    function setRequestToAddProduct(inRequest, productId) {
        var myRequest = inRequest;
        myRequest.url = config.baseUrl + '/Wishlist-AddProduct';
        myRequest.method = 'POST';
        myRequest.form = {
            pid: productId,
            optionId: null,
            optionVal: null
        };
    }

    function setRequestToTogglePublic(inRequest, getListResponse) {
        var bodyAsJson = JSON.parse(getListResponse.body);
        var myRequest = inRequest;
        myRequest.form = {
            listID: bodyAsJson.list.UUID,
            itemID: null
        };

        myRequest.url = config.baseUrl + '/ProductList-TogglePublic';
        myRequest.method = 'POST';
    }

    before(function () {
        // ----- login, set user's wishlist to public, logout

        var myRequest1 = {
            url: '',
            method: '',
            rejectUnauthorized: false,
            resolveWithFullResponse: true,
            jar: cookieJar,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        };

        // 'wluser1@demandware.com', 'Test123!', '701644329402M'
        setRequestUrlAndMethod(myRequest1, 'CSRF-Generate', 'POST');
        return request(myRequest1)
            .then(function (csrfResponse) {
                assert.equal(csrfResponse.statusCode, 200);
                setRequestToLogin(myRequest1, csrfResponse, 'wluser1@demandware.com', 'Test123!');
                return request(myRequest1);
            })
            .then(function (loginResponse) {
                assert.equal(loginResponse.statusCode, 200);
                setCookieJar(myRequest1, cookieJar);
                setRequestToAddProduct(myRequest1, '701644329402M');
                return request(myRequest1);
            })
            .then(function (addToWishListresponse) {
                assert.equal(addToWishListresponse.statusCode, 200);
                setRequestUrlAndMethod(myRequest1, 'Wishlist-GetListJson', 'get');
                return request(myRequest1);
            })
            .then(function (getListResponse) {
                assert.equal(getListResponse.statusCode, 200);
                setRequestToTogglePublic(myRequest1, getListResponse);
                return request(myRequest1);
            })
            .then(function (toggleResponse) {
                assert.equal(toggleResponse.statusCode, 200);
                setRequestUrlAndMethod(myRequest1, 'Login-Logout', 'get');
                return request(myRequest1);
            })
            .then(function (logOffResponse) {
                assert.equal(logOffResponse.statusCode, 200);
            })

            // ----- 'wluser2@demandware.com', 'Test123!', '701644391737M')
            .then(function () {
                setRequestUrlAndMethod(myRequest1, 'CSRF-Generate', 'POST');
                return request(myRequest1);
            })
            .then(function (csrfResponse) {
                setRequestToLogin(myRequest1, csrfResponse, 'wluser2@demandware.com', 'Test123!');
                return request(myRequest1);
            })
            .then(function (loginResponse) {
                assert.equal(loginResponse.statusCode, 200);
                setCookieJar(myRequest1, cookieJar);
                setRequestToAddProduct(myRequest1, '701644391737M');
                return request(myRequest1);
            })
            .then(function (addToWishListresponse) {
                assert.equal(addToWishListresponse.statusCode, 200);
                setRequestUrlAndMethod(myRequest1, 'Wishlist-GetListJson', 'get');
                return request(myRequest1);
            })
            .then(function (getListResponse) {
                assert.equal(getListResponse.statusCode, 200);
                setRequestToTogglePublic(myRequest1, getListResponse);
                return request(myRequest1);
            })
            .then(function (toggleResponse) {
                assert.equal(toggleResponse.statusCode, 200);
                setRequestUrlAndMethod(myRequest1, 'Login-Logout', 'get');
                return request(myRequest1);
            })
            .then(function (logOffResponse) {
                assert.equal(logOffResponse.statusCode, 200);
            })

            // ----- 'wluser3@demandware.com', 'Test123!', '701643238125M'
            .then(function () {
                setRequestUrlAndMethod(myRequest1, 'CSRF-Generate', 'POST');
                return request(myRequest1);
            })
            .then(function (csrfResponse) {
                setRequestToLogin(myRequest1, csrfResponse, 'wluser3@demandware.com', 'Test123!');
                return request(myRequest1);
            })
            .then(function (loginResponse) {
                assert.equal(loginResponse.statusCode, 200);
                setCookieJar(myRequest1, cookieJar);
                setRequestToAddProduct(myRequest1, '701643238125M');
                return request(myRequest1);
            })
            .then(function (addToWishListresponse) {
                assert.equal(addToWishListresponse.statusCode, 200);
                setRequestUrlAndMethod(myRequest1, 'Wishlist-GetListJson', 'get');
                return request(myRequest1);
            })
            .then(function (getListResponse) {
                assert.equal(getListResponse.statusCode, 200);
                setRequestToTogglePublic(myRequest1, getListResponse);
                return request(myRequest1);
            })
            .then(function (toggleResponse) {
                assert.equal(toggleResponse.statusCode, 200);
                setRequestUrlAndMethod(myRequest1, 'Login-Logout', 'get');
                return request(myRequest1);
            })
            .then(function (logOffResponse) {
                assert.equal(logOffResponse.statusCode, 200);
            })

            // ----- 'wluser4@demandware.com', 'Test123!', '701643238064M'
            .then(function () {
                setRequestUrlAndMethod(myRequest1, 'CSRF-Generate', 'POST');
                return request(myRequest1);
            })
            .then(function (csrfResponse) {
                setRequestToLogin(myRequest1, csrfResponse, 'wluser4@demandware.com', 'Test123!');
                return request(myRequest1);
            })
            .then(function (loginResponse) {
                assert.equal(loginResponse.statusCode, 200);
                setCookieJar(myRequest1, cookieJar);
                setRequestToAddProduct(myRequest1, '701643238064M');
                return request(myRequest1);
            })
            .then(function (addToWishListresponse) {
                assert.equal(addToWishListresponse.statusCode, 200);
                setRequestUrlAndMethod(myRequest1, 'Wishlist-GetListJson', 'get');
                return request(myRequest1);
            })
            .then(function (getListResponse) {
                assert.equal(getListResponse.statusCode, 200);
                setRequestToTogglePublic(myRequest1, getListResponse);
                return request(myRequest1);
            })
            .then(function (toggleResponse) {
                assert.equal(toggleResponse.statusCode, 200);
                setRequestUrlAndMethod(myRequest1, 'Login-Logout', 'get');
                return request(myRequest1);
            })
            .then(function (logOffResponse) {
                assert.equal(logOffResponse.statusCode, 200);
            })

            // ----- 'wluser5@demandware.com', 'Test123!', '701644389413M'
            .then(function () {
                setRequestUrlAndMethod(myRequest1, 'CSRF-Generate', 'POST');
                return request(myRequest1);
            })
            .then(function (csrfResponse) {
                setRequestToLogin(myRequest1, csrfResponse, 'wluser5@demandware.com', 'Test123!');
                return request(myRequest1);
            })
            .then(function (loginResponse) {
                assert.equal(loginResponse.statusCode, 200);
                setCookieJar(myRequest1, cookieJar);
                setRequestToAddProduct(myRequest1, '701644389413M');
                return request(myRequest1);
            })
            .then(function (addToWishListresponse) {
                assert.equal(addToWishListresponse.statusCode, 200);
                setRequestUrlAndMethod(myRequest1, 'Wishlist-GetListJson', 'get');
                return request(myRequest1);
            })
            .then(function (getListResponse) {
                assert.equal(getListResponse.statusCode, 200);
                setRequestToTogglePublic(myRequest1, getListResponse);
                return request(myRequest1);
            })
            .then(function (toggleResponse) {
                assert.equal(toggleResponse.statusCode, 200);
                setRequestUrlAndMethod(myRequest1, 'Login-Logout', 'get');
                return request(myRequest1);
            })
            .then(function (logOffResponse) {
                assert.equal(logOffResponse.statusCode, 200);
            })

            // ----- 'wluser6@demandware.com', 'Test123!', '609717701332M'
            .then(function () {
                setRequestUrlAndMethod(myRequest1, 'CSRF-Generate', 'POST');
                return request(myRequest1);
            })
            .then(function (csrfResponse) {
                setRequestToLogin(myRequest1, csrfResponse, 'wluser6@demandware.com', 'Test123!');
                return request(myRequest1);
            })
            .then(function (loginResponse) {
                assert.equal(loginResponse.statusCode, 200);
                setCookieJar(myRequest1, cookieJar);
                setRequestToAddProduct(myRequest1, '609717701332M');
                return request(myRequest1);
            })
            .then(function (addToWishListresponse) {
                assert.equal(addToWishListresponse.statusCode, 200);
                setRequestUrlAndMethod(myRequest1, 'Wishlist-GetListJson', 'get');
                return request(myRequest1);
            })
            .then(function (getListResponse) {
                assert.equal(getListResponse.statusCode, 200);
                setRequestToTogglePublic(myRequest1, getListResponse);
                return request(myRequest1);
            })
            .then(function (toggleResponse) {
                assert.equal(toggleResponse.statusCode, 200);
                setRequestUrlAndMethod(myRequest1, 'Login-Logout', 'get');
                return request(myRequest1);
            })
            .then(function (logOffResponse) {
                assert.equal(logOffResponse.statusCode, 200);
            })

            // ----- 'wluser7@demandware.com', 'Test123!', '708141677203M'
            .then(function () {
                setRequestUrlAndMethod(myRequest1, 'CSRF-Generate', 'POST');
                return request(myRequest1);
            })
            .then(function (csrfResponse) {
                setRequestToLogin(myRequest1, csrfResponse, 'wluser7@demandware.com', 'Test123!');
                return request(myRequest1);
            })
            .then(function (loginResponse) {
                assert.equal(loginResponse.statusCode, 200);
                setCookieJar(myRequest1, cookieJar);
                setRequestToAddProduct(myRequest1, '708141677203M');
                return request(myRequest1);
            })
            .then(function (addToWishListresponse) {
                assert.equal(addToWishListresponse.statusCode, 200);
                setRequestUrlAndMethod(myRequest1, 'Wishlist-GetListJson', 'get');
                return request(myRequest1);
            })
            .then(function (getListResponse) {
                assert.equal(getListResponse.statusCode, 200);
                setRequestToTogglePublic(myRequest1, getListResponse);
                return request(myRequest1);
            })
            .then(function (toggleResponse) {
                assert.equal(toggleResponse.statusCode, 200);
                setRequestUrlAndMethod(myRequest1, 'Login-Logout', 'get');
                return request(myRequest1);
            })
            .then(function (logOffResponse) {
                assert.equal(logOffResponse.statusCode, 200);
            })

            // ----- 'wluser8@demandware.com', 'Test123!', '883360541808M'
            .then(function () {
                setRequestUrlAndMethod(myRequest1, 'CSRF-Generate', 'POST');
                return request(myRequest1);
            })
            .then(function (csrfResponse) {
                setRequestToLogin(myRequest1, csrfResponse, 'wluser8@demandware.com', 'Test123!');
                return request(myRequest1);
            })
            .then(function (loginResponse) {
                assert.equal(loginResponse.statusCode, 200);
                setCookieJar(myRequest1, cookieJar);
                setRequestToAddProduct(myRequest1, '883360541808M');
                return request(myRequest1);
            })
            .then(function (addToWishListresponse) {
                assert.equal(addToWishListresponse.statusCode, 200);
                setRequestUrlAndMethod(myRequest1, 'Wishlist-GetListJson', 'get');
                return request(myRequest1);
            })
            .then(function (getListResponse) {
                assert.equal(getListResponse.statusCode, 200);
                setRequestToTogglePublic(myRequest1, getListResponse);
                return request(myRequest1);
            })
            .then(function (toggleResponse) {
                assert.equal(toggleResponse.statusCode, 200);
                setRequestUrlAndMethod(myRequest1, 'Login-Logout', 'get');
                return request(myRequest1);
            })
            .then(function (logOffResponse) {
                assert.equal(logOffResponse.statusCode, 200);
            })

            // ----- 'wluser10@demandware.com', 'Test123!', '883360352015M'
            .then(function () {
                setRequestUrlAndMethod(myRequest1, 'CSRF-Generate', 'POST');
                return request(myRequest1);
            })
            .then(function (csrfResponse) {
                setRequestToLogin(myRequest1, csrfResponse, 'wluser10@demandware.com', 'Test123!');
                return request(myRequest1);
            })
            .then(function (loginResponse) {
                assert.equal(loginResponse.statusCode, 200);
                setCookieJar(myRequest1, cookieJar);
                setRequestToAddProduct(myRequest1, '883360352015M');
                return request(myRequest1);
            })
            .then(function (addToWishListresponse) {
                assert.equal(addToWishListresponse.statusCode, 200);
                setRequestUrlAndMethod(myRequest1, 'Wishlist-GetListJson', 'get');
                return request(myRequest1);
            })
            .then(function (getListResponse) {
                assert.equal(getListResponse.statusCode, 200);
                setRequestToTogglePublic(myRequest1, getListResponse);
                return request(myRequest1);
            })
            .then(function (toggleResponse) {
                assert.equal(toggleResponse.statusCode, 200);
                setRequestUrlAndMethod(myRequest1, 'Login-Logout', 'get');
                return request(myRequest1);
            })
            .then(function (logOffResponse) {
                assert.equal(logOffResponse.statusCode, 200);
            });
    });

    after(function () {
        // ----- login, remove wishlist, logout

        var cookieJar2 = request.jar();
        var myRequest2 = {
            url: '',
            method: '',
            rejectUnauthorized: false,
            resolveWithFullResponse: true,
            jar: cookieJar2,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        };

        // -- cleanup wluser1@demandware.com
        setRequestUrlAndMethod(myRequest2, 'CSRF-Generate', 'POST');
        return request(myRequest2)
            .then(function (csrfResponse) {
                setRequestToLogin(myRequest2, csrfResponse, 'wluser1@demandware.com', 'Test123!');
                return request(myRequest2);
            })
            .then(function (response) {
                assert.equal(response.statusCode, 200);
                setCookieJar(myRequest2, cookieJar2);
                setRequestUrlAndMethod(myRequest2, 'Wishlist-RemoveList', 'get');
                return request(myRequest2);
            })
            .then(function (removeListResponse) {
                assert.equal(removeListResponse.statusCode, 200);
                setRequestUrlAndMethod(myRequest2, 'Login-Logout', 'get');
                return request(myRequest2);
            })
            .then(function (logOffResponse) {
                assert.equal(logOffResponse.statusCode, 200);
            })

            // -- cleanup wluser2@demandware.com
            .then(function () {
                setRequestUrlAndMethod(myRequest2, 'CSRF-Generate', 'POST');
                return request(myRequest2);
            })
            .then(function (csrfResponse) {
                setRequestToLogin(myRequest2, csrfResponse, 'wluser2@demandware.com', 'Test123!');
                return request(myRequest2);
            })
            .then(function (response) {
                assert.equal(response.statusCode, 200);
                setCookieJar(myRequest2, cookieJar2);
                setRequestUrlAndMethod(myRequest2, 'Wishlist-RemoveList', 'get');
                return request(myRequest2);
            })
            .then(function (removeListResponse) {
                assert.equal(removeListResponse.statusCode, 200);
                setRequestUrlAndMethod(myRequest2, 'Login-Logout', 'get');
                return request(myRequest2);
            })
            .then(function (logOffResponse) {
                assert.equal(logOffResponse.statusCode, 200);
            })

            // -- cleanup wluser3@demandware.com
            .then(function () {
                setRequestUrlAndMethod(myRequest2, 'CSRF-Generate', 'POST');
                return request(myRequest2);
            })
            .then(function (csrfResponse) {
                setRequestToLogin(myRequest2, csrfResponse, 'wluser3@demandware.com', 'Test123!');
                return request(myRequest2);
            })
            .then(function (response) {
                assert.equal(response.statusCode, 200);
                setCookieJar(myRequest2, cookieJar2);
                setRequestUrlAndMethod(myRequest2, 'Wishlist-RemoveList', 'get');
                return request(myRequest2);
            })
            .then(function (removeListResponse) {
                assert.equal(removeListResponse.statusCode, 200);
                setRequestUrlAndMethod(myRequest2, 'Login-Logout', 'get');
                return request(myRequest2);
            })
            .then(function (logOffResponse) {
                assert.equal(logOffResponse.statusCode, 200);
            })

            // -- cleanup wluser4@demandware.com
            .then(function () {
                setRequestUrlAndMethod(myRequest2, 'CSRF-Generate', 'POST');
                return request(myRequest2);
            })
            .then(function (csrfResponse) {
                setRequestToLogin(myRequest2, csrfResponse, 'wluser4@demandware.com', 'Test123!');
                return request(myRequest2);
            })
            .then(function (response) {
                assert.equal(response.statusCode, 200);
                setCookieJar(myRequest2, cookieJar2);
                setRequestUrlAndMethod(myRequest2, 'Wishlist-RemoveList', 'get');
                return request(myRequest2);
            })
            .then(function (removeListResponse) {
                assert.equal(removeListResponse.statusCode, 200);
                setRequestUrlAndMethod(myRequest2, 'Login-Logout', 'get');
                return request(myRequest2);
            })
            .then(function (logOffResponse) {
                assert.equal(logOffResponse.statusCode, 200);
            })

            // -- cleanup wluser5@demandware.com
            .then(function () {
                setRequestUrlAndMethod(myRequest2, 'CSRF-Generate', 'POST');
                return request(myRequest2);
            })
            .then(function (csrfResponse) {
                setRequestToLogin(myRequest2, csrfResponse, 'wluser5@demandware.com', 'Test123!');
                return request(myRequest2);
            })
            .then(function (response) {
                assert.equal(response.statusCode, 200);
                setCookieJar(myRequest2, cookieJar2);
                setRequestUrlAndMethod(myRequest2, 'Wishlist-RemoveList', 'get');
                return request(myRequest2);
            })
            .then(function (removeListResponse) {
                assert.equal(removeListResponse.statusCode, 200);
                setRequestUrlAndMethod(myRequest2, 'Login-Logout', 'get');
                return request(myRequest2);
            })
            .then(function (logOffResponse) {
                assert.equal(logOffResponse.statusCode, 200);
            })

            // -- cleanup wluser6@demandware.com
            .then(function () {
                setRequestUrlAndMethod(myRequest2, 'CSRF-Generate', 'POST');
                return request(myRequest2);
            })
            .then(function (csrfResponse) {
                setRequestToLogin(myRequest2, csrfResponse, 'wluser6@demandware.com', 'Test123!');
                return request(myRequest2);
            })
            .then(function (response) {
                assert.equal(response.statusCode, 200);
                setCookieJar(myRequest2, cookieJar2);
                setRequestUrlAndMethod(myRequest2, 'Wishlist-RemoveList', 'get');
                return request(myRequest2);
            })
            .then(function (removeListResponse) {
                assert.equal(removeListResponse.statusCode, 200);
                setRequestUrlAndMethod(myRequest2, 'Login-Logout', 'get');
                return request(myRequest2);
            })
            .then(function (logOffResponse) {
                assert.equal(logOffResponse.statusCode, 200);
            })

            // -- cleanup wluser7@demandware.com
            .then(function () {
                setRequestUrlAndMethod(myRequest2, 'CSRF-Generate', 'POST');
                return request(myRequest2);
            })
            .then(function (csrfResponse) {
                setRequestToLogin(myRequest2, csrfResponse, 'wluser7@demandware.com', 'Test123!');
                return request(myRequest2);
            })
            .then(function (response) {
                assert.equal(response.statusCode, 200);
                setCookieJar(myRequest2, cookieJar2);
                setRequestUrlAndMethod(myRequest2, 'Wishlist-RemoveList', 'get');
                return request(myRequest2);
            })
            .then(function (removeListResponse) {
                assert.equal(removeListResponse.statusCode, 200);
                setRequestUrlAndMethod(myRequest2, 'Login-Logout', 'get');
                return request(myRequest2);
            })
            .then(function (logOffResponse) {
                assert.equal(logOffResponse.statusCode, 200);
            })

            // -- cleanup wluser8@demandware.com
            .then(function () {
                setRequestUrlAndMethod(myRequest2, 'CSRF-Generate', 'POST');
                return request(myRequest2);
            })
            .then(function (csrfResponse) {
                setRequestToLogin(myRequest2, csrfResponse, 'wluser8@demandware.com', 'Test123!');
                return request(myRequest2);
            })
            .then(function (response) {
                assert.equal(response.statusCode, 200);
                setCookieJar(myRequest2, cookieJar2);
                setRequestUrlAndMethod(myRequest2, 'Wishlist-RemoveList', 'get');
                return request(myRequest2);
            })
            .then(function (removeListResponse) {
                assert.equal(removeListResponse.statusCode, 200);
                setRequestUrlAndMethod(myRequest2, 'Login-Logout', 'get');
                return request(myRequest2);
            })
            .then(function (logOffResponse) {
                assert.equal(logOffResponse.statusCode, 200);
            })

            // -- cleanup wluser10@demandware.com
            .then(function () {
                setRequestUrlAndMethod(myRequest2, 'CSRF-Generate', 'POST');
                return request(myRequest2);
            })
            .then(function (csrfResponse) {
                setRequestToLogin(myRequest2, csrfResponse, 'wluser10@demandware.com', 'Test123!');
                return request(myRequest2);
            })
            .then(function (response) {
                assert.equal(response.statusCode, 200);
                setCookieJar(myRequest2, cookieJar2);
                setRequestUrlAndMethod(myRequest2, 'Wishlist-RemoveList', 'get');
                return request(myRequest2);
            })
            .then(function (removeListResponse) {
                assert.equal(removeListResponse.statusCode, 200);
                setRequestUrlAndMethod(myRequest2, 'Login-Logout', 'get');
                return request(myRequest2);
            })
            .then(function (logOffResponse) {
                assert.equal(logOffResponse.statusCode, 200);
            });
    });

    it('should return the first page of a search result', function () {
        var expectedResult1 = {
            'results': {
                'totalNumber': 8,
                'pageNumber': 1,
                'pageSize': 8,
                'total': 9,
                'totalString': '9 Results',
                'showMore': true,
                'firstName': '',
                'lastName': 'WLuser',
                'changedList': false
            }
        };

        var mySearchRequest = {
            url: '',
            method: 'POST',
            rejectUnauthorized: false,
            resolveWithFullResponse: true,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        };

        mySearchRequest.form = {
            firstName: '',
            lastName: 'WLuser',
            uuids: JSON.stringify([]),
            pageNumber: 1
        };

        mySearchRequest.url = config.baseUrl + '/Wishlist-MoreResults';

        return request(mySearchRequest)
            .then(function (response) {
                assert.equal(response.statusCode, 200, 'Expected statusCode to be 200.');
                var bodyAsJson = JSON.parse(response.body);

                assert.lengthOf(bodyAsJson.results.hits, 8);

                bodyAsJson.results.hits.forEach(function (hit) {
                    assert.notEqual(hit.firstName, 'WLUser9');
                    assert.isNotNull(hit.lastName, 'hit.lastName expected to exist');
                    assert.isNotNull(hit.email, 'hit.email expected to exist');
                    assert.isNotNull(hit.id, 'hit.id expected to exist');
                    assert.isNotNull(hit.url, 'hit.url expected to exist');
                    assert.equal(hit.urlTitle, 'View Wishlist');
                    assert.equal(hit.urlText, 'View');
                });
                assert.equal(bodyAsJson.results.totalNumber, expectedResult1.results.totalNumber);
                assert.equal(bodyAsJson.results.pageNumber, expectedResult1.results.pageNumber);
                assert.equal(bodyAsJson.results.pageSize, expectedResult1.results.pageSize);
                assert.equal(bodyAsJson.results.total, expectedResult1.results.total);
                assert.equal(bodyAsJson.results.totalString, expectedResult1.results.totalString);
                assert.equal(bodyAsJson.results.showMore, expectedResult1.results.showMore);
                assert.isUndefined(bodyAsJson.results.firstName, expectedResult1.results.firstName);
                assert.equal(bodyAsJson.results.lastName, expectedResult1.results.lastName);
                assert.equal(bodyAsJson.results.changedList, expectedResult1.results.changedList);
            });
    });

    it('should return the second / last page in a search result of wishlist', function () {
        var expectedResult2 = {
            'results': {
                'totalNumber': 1,
                'pageNumber': 2,
                'pageSize': 8,
                'total': 9,
                'totalString': '9 Results',
                'showMore': false,
                'firstName': '',
                'lastName': 'WLuser',
                'changedList': false
            }
        };

        var mySearchRequest = {
            url: '',
            method: 'POST',
            rejectUnauthorized: false,
            resolveWithFullResponse: true,
            jar: cookieJar,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        };

        mySearchRequest.form = {
            firstName: '',
            lastName: 'WLuser',
            uuids: JSON.stringify([]),
            pageNumber: 2
        };

        mySearchRequest.url = config.baseUrl + '/Wishlist-MoreResults';

        return request(mySearchRequest)
            .then(function (response) {
                assert.equal(response.statusCode, 200, 'Expected statusCode to be 200.');
                var bodyAsJson = JSON.parse(response.body);

                assert.lengthOf(bodyAsJson.results.hits, 1);

                bodyAsJson.results.hits.forEach(function (hit) {
                    assert.notEqual(hit.firstName, 'WLUser9');
                    assert.isNotNull(hit.lastName, 'hit.lastName expected to exist');
                    assert.isNotNull(hit.email, 'hit.email expected to exist');
                    assert.isNotNull(hit.id, 'hit.id expected to exist');
                    assert.isNotNull(hit.url, 'hit.url expected to exist');
                    assert.equal(hit.urlTitle, 'View Wishlist');
                    assert.equal(hit.urlText, 'View');
                });
                assert.equal(bodyAsJson.results.totalNumber, expectedResult2.results.totalNumber);
                assert.equal(bodyAsJson.results.pageNumber, expectedResult2.results.pageNumber);
                assert.equal(bodyAsJson.results.pageSize, expectedResult2.results.pageSize);
                assert.equal(bodyAsJson.results.total, expectedResult2.results.total);
                assert.equal(bodyAsJson.results.totalString, expectedResult2.results.totalString);
                assert.equal(bodyAsJson.results.showMore, expectedResult2.results.showMore);
                assert.isUndefined(bodyAsJson.results.firstName, expectedResult2.results.firstName);
                assert.equal(bodyAsJson.results.lastName, expectedResult2.results.lastName);
                assert.equal(bodyAsJson.results.changedList, expectedResult2.results.changedList);
            });
    });

    it('should return hit when first name is used.', function () {
        var mySearchRequest = {
            url: '',
            method: 'POST',
            rejectUnauthorized: false,
            resolveWithFullResponse: true,
            jar: cookieJar,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        };

        mySearchRequest.form = {
            firstName: 'WLUser1',
            lastName: '',
            uuids: JSON.stringify([]),
            pageNumber: 1
        };

        mySearchRequest.url = config.baseUrl + '/Wishlist-MoreResults';

        return request(mySearchRequest)
            .then(function (response) {
                assert.equal(response.statusCode, 200, 'Expected statusCode to be 200.');
                var bodyAsJson = JSON.parse(response.body);

                var hits = bodyAsJson.results.hits;
                assert.lengthOf(hits, 1);
                assert.equal(hits[0].firstName, 'WLUser1');
                assert.equal(hits[0].lastName, 'WLuser');
            });
    });

    it('should return hit when both first name and last name are used.', function () {
        var mySearchRequest = {
            url: '',
            method: 'POST',
            rejectUnauthorized: false,
            resolveWithFullResponse: true,
            jar: cookieJar,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        };

        mySearchRequest.form = {
            firstName: 'WLUser2',
            lastName: 'WLuser',
            uuids: JSON.stringify([]),
            pageNumber: 1
        };

        mySearchRequest.url = config.baseUrl + '/Wishlist-MoreResults';

        return request(mySearchRequest)
            .then(function (response) {
                assert.equal(response.statusCode, 200, 'Expected statusCode to be 200.');
                var bodyAsJson = JSON.parse(response.body);

                var hits = bodyAsJson.results.hits;
                assert.lengthOf(hits, 1);
                assert.equal(hits[0].firstName, 'WLUser2');
                assert.equal(hits[0].lastName, 'WLuser');
                assert.isNotNull(hits[0].id, 'hit.id expected to exist');
                assert.isNotNull(hits[0].url, 'hit.url expected to exist');
            });
    });

    it('should return empty hits when there is no match.', function () {
        var mySearchRequest = {
            url: '',
            method: 'POST',
            rejectUnauthorized: false,
            resolveWithFullResponse: true,
            jar: cookieJar,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        };

        mySearchRequest.form = {
            firstName: '',
            lastName: 'abc',
            uuids: JSON.stringify([]),
            pageNumber: 1
        };

        mySearchRequest.url = config.baseUrl + '/Wishlist-MoreResults';

        return request(mySearchRequest)
            .then(function (response) {
                assert.equal(response.statusCode, 200, 'Expected statusCode to be 200.');
                var bodyAsJson = JSON.parse(response.body);

                assert.lengthOf(bodyAsJson.results.hits, 0);
            });
    });
});
