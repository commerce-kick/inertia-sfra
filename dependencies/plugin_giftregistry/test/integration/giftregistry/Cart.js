'use strict';

var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');

var cookieJar = request.jar();
var registryID;
var productListItemID1;
var productListItemID2;

// event variables
var addressID1 = 'preShippingTitle';

describe('Cart AddProductListItem', function () {
    this.timeout(9000);
    before(function () {
        var myRequest = {
            url: config.baseUrl + '/CSRF-Generate',
            method: 'POST',
            rejectUnauthorized: false,
            resolveWithFullResponse: true,
            jar: cookieJar,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        };

        return request(myRequest)
            .then(function (csrfResponse) {
                // Log in to the storefront
                assert.equal(csrfResponse.statusCode, 200);
                var csrfJsonResponse = JSON.parse(csrfResponse.body);
                var csrfToken = csrfJsonResponse.csrf.token;
                myRequest.url = config.baseUrl + '/Account-Login?' + csrfJsonResponse.csrf.tokenName + '=' + csrfToken;
                myRequest.form = {
                    loginEmail: 'wluser1@demandware.com',
                    loginPassword: 'Test123!',
                    csrf_token: csrfToken
                };
                return request(myRequest);
            })
            .then(function (loginResponse) {
                // create a gift registry
                assert.equal(loginResponse.statusCode, 200);
                myRequest.url = config.baseUrl + '/CSRF-Generate';
                return request(myRequest);
            })
            .then(function (csrfResponse2) {
                // submit the form to create a registry
                assert.equal(csrfResponse2.statusCode, 200);
                var csrfJsonResponse2 = JSON.parse(csrfResponse2.body);
                var csrfToken2 = csrfJsonResponse2.csrf.token;
                myRequest.url = config.baseUrl + '/GiftRegistry-CreateRegistry?';
                myRequest.form = {
                    csrf_token: csrfToken2,
                    dwfrm_giftRegistry_giftRegistryEvent_event_eventName: 'EventName',
                    dwfrm_giftRegistry_giftRegistryEvent_event_eventDate: '08-10-2018',
                    dwfrm_giftRegistry_giftRegistryEvent_event_eventCountry: 'US',
                    dwfrm_giftRegistry_giftRegistryEvent_event_eventState_stateCode: 'NH',
                    dwfrm_giftRegistry_giftRegistryEvent_event_eventCity: 'eventCity',
                    dwfrm_giftRegistry_giftRegistryEvent_registrant_role: 'registrantRole',
                    dwfrm_giftRegistry_giftRegistryEvent_registrant_firstName: 'registrantFirstName',
                    dwfrm_giftRegistry_giftRegistryEvent_registrant_lastName: 'registrantLastName',
                    dwfrm_giftRegistry_giftRegistryEvent_registrant_email: 'someone@somewhere.com',
                    dwfrm_giftRegistry_coRegistrantCheck: false,
                    grAddressSelector: 'new',
                    dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_addressId: 'preShippingTitle',
                    dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_firstName: 'firstName-shipping-pre',
                    dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_lastName: 'lastName-shipping-pre',
                    dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_address1: 'address1-shipping-pre',
                    dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_address2: 'address2-shipping-pre',
                    dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_country: 'US',
                    dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_states_stateCode: 'NH',
                    dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_city: 'eventCity',
                    dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_postalCode: '01801',
                    dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_phone: '9009009000',
                    address_saved: 'new',
                    dwfrm_giftRegistry_postShippingCheck: false
                };
                return request(myRequest);
            })
            .then(function (createRegistryResponse) {
                assert.equal(createRegistryResponse.statusCode, 200);
                var createRegistryResponseBody = JSON.parse(createRegistryResponse.body);
                registryID = createRegistryResponseBody.ID;
                return request(myRequest);
            })
            .then(function (createRegistryResponseWithID) {
                assert.equal(createRegistryResponseWithID.statusCode, 200);
                myRequest.method = 'GET';
                var giftRegistryEndpoint = '/GiftRegistry-AddProductInterceptAjax';
                var queryString = '?rurl=3&args=%257B%2522pid%2522%253A%2522701644391737M%2522%252C%2522qty%2522%253A1%257D';
                myRequest.url = config.baseUrl + giftRegistryEndpoint + queryString;
                return request(myRequest);
            })
            .then(function (addToGRResponse1) {
                assert.equal(addToGRResponse1.statusCode, 200);
                myRequest.method = 'GET';
                var giftRegistryEndpoint = '/GiftRegistry-AddProductInterceptAjax';
                var queryString = '?rurl=3&args=%257B%2522pid%2522%253A%2522750518699578M%2522%252C%2522qty%2522%253A1%257D';
                myRequest.url = config.baseUrl + giftRegistryEndpoint + queryString;
                return request(myRequest);
            })
            .then(function (addToGRResponse2) {
                assert.equal(addToGRResponse2.statusCode, 200);
                var giftRegistryEndpoint = '/GiftRegistry-GetListJson';
                var queryString = '?id=' + registryID;
                myRequest.url = config.baseUrl + giftRegistryEndpoint + queryString;
                return request(myRequest);
            })
            .then(function (getListResponse) {
                assert.equal(getListResponse.statusCode, 200);
                var getListResponseBody = JSON.parse(getListResponse.body);
                productListItemID1 = getListResponseBody.list.items[0].UUID;
                productListItemID2 = getListResponseBody.list.items[1].UUID;
                myRequest.method = 'GET';
                myRequest.url = config.baseUrl + '/Login-Logout';
                return request(myRequest);
            })
            .then(function (logoutResponse) {
                assert.equal(logoutResponse.statusCode, 200);
            });
    });

    after(function () {
        var myRequestAfter = {
            url: config.baseUrl + '/CSRF-Generate',
            method: 'POST',
            rejectUnauthorized: false,
            resolveWithFullResponse: true,
            jar: cookieJar,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        };

        return request(myRequestAfter)
            .then(function (csrfResponse) {
                // Log in to the storefront
                assert.equal(csrfResponse.statusCode, 200);
                var csrfJsonResponse = JSON.parse(csrfResponse.body);
                var csrfToken = csrfJsonResponse.csrf.token;
                myRequestAfter.url = config.baseUrl + '/Account-Login?' + csrfJsonResponse.csrf.tokenName + '=' + csrfToken;
                myRequestAfter.form = {
                    loginEmail: 'wluser1@demandware.com',
                    loginPassword: 'Test123!',
                    csrf_token: csrfToken
                };
                return request(myRequestAfter);
            })
            .then(function (loginResponse) {
                // create a gift registry
                assert.equal(loginResponse.statusCode, 200);

                myRequestAfter = {
                    url: config.baseUrl + '/GiftRegistry-RemoveList?id=' + registryID,
                    method: 'GET',
                    rejectUnauthorized: false,
                    resolveWithFullResponse: true,
                    jar: cookieJar,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                };

                return request(myRequestAfter);
            })
            .then(function (removeListResponse) {
                assert.equal(removeListResponse.statusCode, 200);
                myRequestAfter.url = config.baseUrl + '/Address-DeleteAddress?addressId=' + addressID1 + '&isDefault=true';
                return request(myRequestAfter);
            })
            .then(function (deletAddressResponse) {
                assert.equal(deletAddressResponse.statusCode, 200);
            });
    });

    it('should add a Product to the Cart - AddProductListItem', function () {
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

        var giftRegistryEndpoint = '/Cart-AddProductListItem';
        myRequest.url = config.baseUrl + giftRegistryEndpoint;

        myRequest.form = {
            plid: registryID,
            pid: productListItemID1,
            qty: '1'
        };

        return request(myRequest)
            .then(function (response) {
                assert.equal(response.statusCode, 200);

                var bodyAsJson = JSON.parse(response.body);
                assert.isTrue(bodyAsJson.success);
                assert.equal(bodyAsJson.quantityTotal, 1);
                assert.equal(bodyAsJson.cart.numOfShipments, 2);
                assert.equal(bodyAsJson.cart.numItems, 1);
            });
    });

    it('should add a Product to the Cart when item is already in the cart - AddProductListItem', function () {
        var myRequest2 = {
            url: '',
            method: 'POST',
            rejectUnauthorized: false,
            resolveWithFullResponse: true,
            jar: cookieJar,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        };

        var giftRegistryEndpoint = '/Cart-AddProductListItem';
        myRequest2.url = config.baseUrl + giftRegistryEndpoint;

        myRequest2.form = {
            plid: registryID,
            pid: productListItemID1,
            qty: '1'
        };

        return request(myRequest2)
            .then(function (response) {
                assert.equal(response.statusCode, 200);

                var bodyAsJson = JSON.parse(response.body);
                assert.isTrue(bodyAsJson.success);
                assert.equal(bodyAsJson.quantityTotal, 2);
                assert.equal(bodyAsJson.cart.numOfShipments, 2);
                assert.equal(bodyAsJson.cart.numItems, 2);
            });
    });

    it('should add a Product to the Cart when item is already in the cart and no qty passed in - AddProductListItem', function () {
        var myRequest3 = {
            url: '',
            method: 'POST',
            rejectUnauthorized: false,
            resolveWithFullResponse: true,
            jar: cookieJar,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        };

        var giftRegistryEndpoint = '/Cart-AddProductListItem';
        myRequest3.url = config.baseUrl + giftRegistryEndpoint;

        myRequest3.form = {
            plid: registryID,
            pid: productListItemID1
        };

        return request(myRequest3)
            .then(function (response) {
                assert.equal(response.statusCode, 200);

                var bodyAsJson = JSON.parse(response.body);
                assert.isTrue(bodyAsJson.success);
                assert.equal(bodyAsJson.quantityTotal, 3);
                assert.equal(bodyAsJson.cart.numOfShipments, 2);
                assert.equal(bodyAsJson.cart.numItems, 3);
            });
    });

    it('should add a different Product to the Cart - AddProductListItem', function () {
        var myRequest4 = {
            url: '',
            method: 'POST',
            rejectUnauthorized: false,
            resolveWithFullResponse: true,
            jar: cookieJar,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        };

        var giftRegistryEndpoint = '/Cart-AddProductListItem';
        myRequest4.url = config.baseUrl + giftRegistryEndpoint;

        myRequest4.form = {
            plid: registryID,
            pid: productListItemID2,
            qty: '1'
        };

        return request(myRequest4)
            .then(function (response) {
                assert.equal(response.statusCode, 200);

                var bodyAsJson = JSON.parse(response.body);
                assert.isTrue(bodyAsJson.success);
                assert.equal(bodyAsJson.quantityTotal, 4);
                assert.equal(bodyAsJson.cart.numOfShipments, 3);
                assert.equal(bodyAsJson.cart.numItems, 4);
            });
    });

    it('should fail to add product to Cart when quantity is unavailable Cart - AddProductListItem', function () {
        var myRequest4 = {
            url: '',
            method: 'POST',
            rejectUnauthorized: false,
            resolveWithFullResponse: true,
            jar: cookieJar,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        };

        var giftRegistryEndpoint = '/Cart-AddProductListItem';
        myRequest4.url = config.baseUrl + giftRegistryEndpoint;

        myRequest4.form = {
            plid: registryID,
            pid: productListItemID2,
            qty: '10000'
        };

        return request(myRequest4)
            .then(function (response) {
                assert.equal(response.statusCode, 200);

                var bodyAsJson = JSON.parse(response.body);
                assert.isFalse(bodyAsJson.success);
                assert.equal(bodyAsJson.quantityTotal, 4);
                assert.equal(bodyAsJson.cart.numOfShipments, 3);
                assert.equal(bodyAsJson.cart.numItems, 4);
                assert.equal(bodyAsJson.msg, 'Only "100" items in stock. Selected quantity for "Black Single Pleat Athletic Fit Wool Suit" cannot be added to the cart');
            });
    });
});
