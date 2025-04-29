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

describe('My Account: delete address being used by gift registry ', function () {
    this.timeout(60000);

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
                    loginEmail: 'wluser3@demandware.com',
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

            .then(function (csrfResponse) {
                // get csrf token
                assert.equal(csrfResponse.statusCode, 200);
                var csrfJsonResponse = JSON.parse(csrfResponse.body);
                var csrfToken = csrfJsonResponse.csrf.token;

                // create gift registry
                myRequest.url = config.baseUrl + '/GiftRegistry-CreateRegistry?';
                myRequest.form = {
                    csrf_token: csrfToken,
                    dwfrm_giftRegistry_giftRegistryEvent_event_eventName: EventName,
                    dwfrm_giftRegistry_giftRegistryEvent_event_eventDate: '08-10-2018',
                    dwfrm_giftRegistry_giftRegistryEvent_event_eventCountry: eventCountryCode,
                    dwfrm_giftRegistry_giftRegistryEvent_event_eventState_stateCode: eventState,
                    dwfrm_giftRegistry_giftRegistryEvent_event_eventCity: eventCity,
                    dwfrm_giftRegistry_giftRegistryEvent_registrant_role: registrantRole,
                    dwfrm_giftRegistry_giftRegistryEvent_registrant_firstName: firstNameRegistrant,
                    dwfrm_giftRegistry_giftRegistryEvent_registrant_lastName: lastNameRegistrant,
                    dwfrm_giftRegistry_giftRegistryEvent_registrant_email: registrantEmail,
                    dwfrm_giftRegistry_coRegistrantCheck: false,
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
            .then(function (createRegistryResponse) {
                assert.equal(createRegistryResponse.statusCode, 200);
                var createRegistryResponseBody = JSON.parse(createRegistryResponse.body);

                registryID = createRegistryResponseBody.ID;
                delete myRequest.form;
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

    it('should NOT be able to delete pre-Event Shipping Address being used in gift registry', function () {
        myRequest.method = 'GET';
        myRequest.url = config.baseUrl + '/Address-DeleteAddress?addressId=' + addressID1 + '&isDefault=true';

        return request(myRequest)
            .then(function (response) {
                assert.equal(response.statusCode, 500);
            })
            .catch(function (errorResponse) {
                assert.equal(errorResponse.statusCode, 500);

                var bodyAsJson = JSON.parse(errorResponse.response.body);
                var expectedErrorMsg = 'Cannot delete ' + addressID1 + ' address as it’s linked to a Gift Registry.';
                assert.equal(bodyAsJson.errorMessage, expectedErrorMsg);
            });
    });

    it('should NOT be able to delete post-Event Shipping Address being used in gift registry', function () {
        myRequest.method = 'GET';
        myRequest.url = config.baseUrl + '/Address-DeleteAddress?addressId=' + addressID2 + '&isDefault=false';

        return request(myRequest)
            .then(function (response) {
                assert.equal(response.statusCode, 500);
            })
            .catch(function (response) {
                assert.equal(response.statusCode, 500);

                var respErr = JSON.parse(response.error);
                var expectedErrorMsg = 'Cannot delete ' + addressID2 + ' address as it’s linked to a Gift Registry.';
                assert.equal(respErr.errorMessage, expectedErrorMsg);
            });
    });
});
