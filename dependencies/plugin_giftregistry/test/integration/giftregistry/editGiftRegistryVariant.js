'use strict';

var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');

var cookieJar = request.jar();
var registryID;

// event variables
var EventName = 'EventName';
var eventCountryCode = 'US';
var eventState = 'NH';
var eventCity = 'eventCity';

// registrants
var firstNameRegistrant = 'registrantFirstName';
var lastNameRegistrant = 'registrantLastName';
var registrantRole = 'registrantRole';
var registrantEmail = 'someone@somewhere.com';

var firstNameCoRegistrant = 'coRegistrantFirstName';
var lastNameCoRegistrant = 'coRegistrantLastName';
var coRegistrantRole = 'coRegistrantRole';
var coRegistrantEmail = 'someone2@somewhere.com';

// addresses
var addressID1 = 'preShippingTitle';
var preAddressFirstName = 'firstName-shipping-pre';
var preAddressLastName = 'lastName-shipping-pre';
var preAddress1 = 'address1-shipping-pre';
var preAddress2 = 'address2-shipping-pre';
var preAddressCity = 'city-shipping-pre';
var preAddressZip = '01801';
var preAddressPhone = '9009009000';

var addressID2 = 'postShippingTitle';
var postAddressFirstName = 'firstName-shipping-post';
var postAddressLastName = 'lastName-shipping-post';
var postAddress1 = 'address1-shipping-post';
var postAddress2 = 'address2-shipping-post';
var postAddressCity = 'city-shipping-post';
var postAddressZip = '90210';
var postAddressPhone = '1001001000';

describe('GiftRegistry: edit product variant', function () {
    this.timeout(60000);

    var prodIdUuidMap = {};
    var variant1 = '701643421084M'; // pid = 701643421084M (3/4 Sleeve V-Neck Top, color = mint, size = XS)
    var variant2 = '701642923558M'; // pid = 701642923558M (3/4 Sleeve V-Neck Top, color = grey, size = XL)
    var variant3 = '701642923442M'; // pid = 701642923442M (3/4 Sleeve V-Neck Top, color = butter, size = L)

    var myRequest;

    before(function () {
        myRequest = {
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
                    loginEmail: 'wluser2@demandware.com',
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
                    dwfrm_giftRegistry_giftRegistryEvent_event_eventName: EventName,
                    dwfrm_giftRegistry_giftRegistryEvent_event_eventDate: '08-10-2018',
                    dwfrm_giftRegistry_giftRegistryEvent_event_eventCountry: eventCountryCode,
                    dwfrm_giftRegistry_giftRegistryEvent_event_eventState_stateCode: eventState,
                    dwfrm_giftRegistry_giftRegistryEvent_event_eventCity: eventCity,
                    dwfrm_giftRegistry_giftRegistryEvent_registrant_role: registrantRole,
                    dwfrm_giftRegistry_giftRegistryEvent_registrant_firstName: firstNameRegistrant,
                    dwfrm_giftRegistry_giftRegistryEvent_registrant_lastName: lastNameRegistrant,
                    dwfrm_giftRegistry_giftRegistryEvent_registrant_email: registrantEmail,
                    dwfrm_giftRegistry_coRegistrantCheck: true,
                    dwfrm_giftRegistry_giftRegistryEvent_coRegistrant_role: coRegistrantRole,
                    dwfrm_giftRegistry_giftRegistryEvent_coRegistrant_firstName: firstNameCoRegistrant,
                    dwfrm_giftRegistry_giftRegistryEvent_coRegistrant_lastName: lastNameCoRegistrant,
                    dwfrm_giftRegistry_giftRegistryEvent_coRegistrant_email: coRegistrantEmail,
                    grAddressSelector: 'new',
                    dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_addressId: addressID1,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_firstName: preAddressFirstName,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_lastName: preAddressLastName,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_address1: preAddress1,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_address2: preAddress2,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_country: eventCountryCode,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_states_stateCode: eventState,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_city: preAddressCity,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_postalCode: preAddressZip,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_phone: preAddressPhone,
                    address_saved: 'new',
                    dwfrm_giftRegistry_postShippingCheck: true,
                    post_grAddressSelector: 'new',
                    dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_addressId: addressID2,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_firstName: postAddressFirstName,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_lastName: postAddressLastName,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_address1: postAddress1,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_address2: postAddress2,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_country: eventCountryCode,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_states_stateCode: eventState,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_city: postAddressCity,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_postalCode: postAddressZip,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_phone: postAddressPhone,
                    post_address_saved: 'new'
                };
                return request(myRequest);
            })

            // Add product variant1 to gift registry
            .then(function (createRegistryResponse) {
                assert.equal(createRegistryResponse.statusCode, 200);
                var createRegistryResponseBody = JSON.parse(createRegistryResponse.body);
                registryID = createRegistryResponseBody.ID;

                // add product1 to gift registry
                myRequest.method = 'GET';
                var giftRegistryEndpoint = '/GiftRegistry-AddProductInterceptAjax';
                var queryString = '?rurl=3&args=%257B%2522pid%2522%253A%2522' + variant1 + '%2522%252C%2522qty%2522%253A1%257D';
                myRequest.url = config.baseUrl + giftRegistryEndpoint + queryString;
                return request(myRequest);
            })
            .then(function (response) {
                assert.equal(response.statusCode, 200);

                // select the registry to add the product1
                myRequest.method = 'POST';
                var giftRegistryEndpoint = '/GiftRegistry-AddProduct';
                var queryString = '?id=' + registryID + '&args=%257B%2522pid%2522%253A%2522' + variant1 + '%2522%252C%2522qty%2522%253A1%257D';
                myRequest.url = config.baseUrl + giftRegistryEndpoint + queryString;
                return request(myRequest);
            })

            // add product variant2 to gift registry
            .then(function (response) {
                assert.equal(response.statusCode, 200);

                // add product2 to gift registry
                myRequest.method = 'GET';
                var giftRegistryEndpoint = '/GiftRegistry-AddProductInterceptAjax';
                var queryString = '?rurl=3&args=%257B%2522pid%2522%253A%2522' + variant2 + '%2522%252C%2522qty%2522%253A1%257D';
                myRequest.url = config.baseUrl + giftRegistryEndpoint + queryString;
                return request(myRequest);
            })
            .then(function (response) {
                assert.equal(response.statusCode, 200);

                // select the registry to add the product2
                myRequest.method = 'POST';
                var giftRegistryEndpoint = '/GiftRegistry-AddProduct';
                var queryString = '?id=' + registryID + '&args=%257B%2522pid%2522%253A%2522' + variant2 + '%2522%252C%2522qty%2522%253A1%257D';
                myRequest.url = config.baseUrl + giftRegistryEndpoint + queryString;
                return request(myRequest);
            })

            .then(function (response) {
                assert.equal(response.statusCode, 200);

                // get list
                myRequest.method = 'GET';
                var giftRegistryEndpoint = '/GiftRegistry-GetListJson';
                var queryString = '?id=' + registryID;
                myRequest.url = config.baseUrl + giftRegistryEndpoint + queryString;
                return request(myRequest);
            })
            .then(function (response) {
                assert.equal(response.statusCode, 200);

                var bodyAsJson = JSON.parse(response.body);
                prodIdUuidMap[bodyAsJson.list.items[0].pid] = bodyAsJson.list.items[0].UUID;
                prodIdUuidMap[bodyAsJson.list.items[1].pid] = bodyAsJson.list.items[1].UUID;
            });
    });

    after(function () {
        myRequest.method = 'GET';
        myRequest.url = config.baseUrl + '/GiftRegistry-RemoveList?id=' + registryID;

        return request(myRequest)
            .then(function (responseAfter) {
                assert.equal(responseAfter.statusCode, 200);

                myRequest.url = config.baseUrl + '/Address-DeleteAddress?addressId=' + addressID2 + '&isDefault=false';
                return request(myRequest);
            })
            .then(function (responseAfter) {
                assert.equal(responseAfter.statusCode, 200);

                myRequest.url = config.baseUrl + '/Address-DeleteAddress?addressId=' + addressID1 + '&isDefault=true';
                return request(myRequest);
            });
    });

    it('should be able to update the item to itself', function () {
        myRequest.method = 'POST';
        var giftRegistryEndpoint = '/GiftRegistry-EditProductListItem';
        myRequest.form = {
            uuid: prodIdUuidMap[variant1],
            id: registryID,
            pid: variant1,
            quantityDesired: '1'
        };
        myRequest.url = config.baseUrl + giftRegistryEndpoint;

        return request(myRequest)
            .then(function (response) {
                assert.equal(response.statusCode, 200);

                var bodyAsJson = JSON.parse(response.body);
                assert.isNotNull(bodyAsJson.giftRegistryList);

                // get list
                myRequest.method = 'GET';
                giftRegistryEndpoint = '/GiftRegistry-GetListJson';
                var queryString = '?id=' + registryID;
                myRequest.url = config.baseUrl + giftRegistryEndpoint + queryString;
                return request(myRequest);
            })
            .then(function (response) {
                assert.equal(response.statusCode, 200);

                var bodyAsJson = JSON.parse(response.body);

                var qtyMap = {};
                qtyMap[bodyAsJson.list.items[0].pid] = bodyAsJson.list.items[0].qty;
                qtyMap[bodyAsJson.list.items[1].pid] = bodyAsJson.list.items[1].qty;

                assert.equal(qtyMap[variant1], '1');
            });
    });

    it('should be able to update to a new variant not exist on the list', function () {
        // edit variant2 to change to variant3
        myRequest.method = 'POST';
        var giftRegistryEndpoint = '/GiftRegistry-EditProductListItem';
        myRequest.form = {
            uuid: prodIdUuidMap[variant2],
            id: registryID,
            pid: variant3,
            quantityDesired: '2'
        };
        myRequest.url = config.baseUrl + giftRegistryEndpoint;

        return request(myRequest)
            .then(function (response) {
                assert.equal(response.statusCode, 200);

                var bodyAsJson = JSON.parse(response.body);
                assert.isNotNull(bodyAsJson.giftRegistryList);

                // get list
                myRequest.method = 'GET';
                giftRegistryEndpoint = '/GiftRegistry-GetListJson';
                var queryString = '?id=' + registryID;
                myRequest.url = config.baseUrl + giftRegistryEndpoint + queryString;
                return request(myRequest);
            })
            .then(function (response) {
                assert.equal(response.statusCode, 200);

                var bodyAsJson = JSON.parse(response.body);

                prodIdUuidMap[bodyAsJson.list.items[0].pid] = bodyAsJson.list.items[0].UUID;
                prodIdUuidMap[bodyAsJson.list.items[1].pid] = bodyAsJson.list.items[1].UUID;

                var qtyMap = {};
                qtyMap[bodyAsJson.list.items[0].pid] = bodyAsJson.list.items[0].qty;
                qtyMap[bodyAsJson.list.items[1].pid] = bodyAsJson.list.items[1].qty;

                assert.equal(bodyAsJson.list.items.length, 2);
                assert.equal(qtyMap[variant1], '1');
                assert.equal(qtyMap[variant3], '2');
            });
    });

    it('should be able to update to a variant already exist on the list', function () {
        // edit the second product to variant1
        myRequest.method = 'POST';
        var giftRegistryEndpoint = '/GiftRegistry-EditProductListItem';
        myRequest.form = {
            uuid: prodIdUuidMap[variant3],
            id: registryID,
            pid: variant1,
            quantityDesired: '2'
        };
        myRequest.url = config.baseUrl + giftRegistryEndpoint;

        return request(myRequest)
            .then(function (response) {
                assert.equal(response.statusCode, 200);

                var bodyAsJson = JSON.parse(response.body);
                assert.isNotNull(bodyAsJson.giftRegistryList);

                // get list
                myRequest.method = 'GET';
                giftRegistryEndpoint = '/GiftRegistry-GetListJson';
                var queryString = '?id=' + registryID;
                myRequest.url = config.baseUrl + giftRegistryEndpoint + queryString;
                return request(myRequest);
            })
            .then(function (response) {
                assert.equal(response.statusCode, 200);

                var bodyAsJson = JSON.parse(response.body);

                assert.equal(bodyAsJson.list.items.length, 1);
                assert.equal(bodyAsJson.list.items[0].pid, variant1);
                assert.equal(bodyAsJson.list.items[0].qty, '3');
            });
    });
});
