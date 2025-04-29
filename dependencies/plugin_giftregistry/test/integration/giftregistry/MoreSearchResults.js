'use strict';

var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');
var chai = require('chai');
var chaiSubset = require('chai-subset');
chai.use(chaiSubset);

describe('GiftRegistry - MoreSearchResults', function () {
    this.timeout(50000);

    var cookieJar = request.jar();
    var registryID;
    var registryID2;
    var registryID3;
    var registryID4;
    var registryID5;
    var registryID6;
    var registryID7;
    var registryID8;
    var registryID9;

    // event variables
    var EventName = 'EventName';
    var eventCountryCode = 'US';
    var eventState = 'NH';
    var eventCity = 'eventCity';

    // regestrant
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

    var addressID2 = 'addressID2';
    var addressID3 = 'addressID3';
    var addressID4 = 'addressID4';
    var addressID5 = 'addressID5';
    var addressID6 = 'addressID6';
    var addressID7 = 'addressID7';
    var addressID8 = 'addressID8';
    var addressID9 = 'addressID9';

    function fillRegistryForm(csrfToken, addressIDParam) {
        var filledForm = {
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
            dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_addressId: addressIDParam,
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
            dwfrm_giftRegistry_postShippingCheck: false
        };
        return filledForm;
    }

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
                assert.equal(loginResponse.statusCode, 200);
                myRequest.url = config.baseUrl + '/CSRF-Generate';
                return request(myRequest);
            })
            .then(function (csrfResponse) {
                assert.equal(csrfResponse.statusCode, 200);
                var csrfToken = JSON.parse(csrfResponse.body).csrf.token;
                myRequest.url = config.baseUrl + '/GiftRegistry-CreateRegistry?';
                myRequest.form = fillRegistryForm(csrfToken, addressID1);
                return request(myRequest);
            })
            .then(function (createRegistryResponse) {
                assert.equal(createRegistryResponse.statusCode, 200);
                registryID = JSON.parse(createRegistryResponse.body).ID;
                myRequest.url = config.baseUrl + '/ProductList-TogglePublic?ID=' + registryID + '&type=11';
                return request(myRequest);
            })
            .then(function () {
                myRequest.url = config.baseUrl + '/CSRF-Generate';
                return request(myRequest);
            })
            .then(function (csrfResponse) {
                assert.equal(csrfResponse.statusCode, 200);
                var csrfToken = JSON.parse(csrfResponse.body).csrf.token;
                myRequest.url = config.baseUrl + '/GiftRegistry-CreateRegistry?';
                myRequest.form = fillRegistryForm(csrfToken, addressID2);
                return request(myRequest);
            })
            .then(function (createRegistryResponse) {
                assert.equal(createRegistryResponse.statusCode, 200);
                registryID2 = JSON.parse(createRegistryResponse.body).ID;
                myRequest.url = config.baseUrl + '/ProductList-TogglePublic?ID=' + registryID2 + '&type=11';
                return request(myRequest);
            })
            .then(function () {
                myRequest.url = config.baseUrl + '/CSRF-Generate';
                return request(myRequest);
            })
            .then(function (csrfResponse) {
                assert.equal(csrfResponse.statusCode, 200);
                var csrfToken = JSON.parse(csrfResponse.body).csrf.token;
                myRequest.url = config.baseUrl + '/GiftRegistry-CreateRegistry?';
                myRequest.form = fillRegistryForm(csrfToken, addressID3);
                return request(myRequest);
            })
            .then(function (createRegistryResponse) {
                assert.equal(createRegistryResponse.statusCode, 200);
                registryID3 = JSON.parse(createRegistryResponse.body).ID;
                myRequest.url = config.baseUrl + '/ProductList-TogglePublic?ID=' + registryID3 + '&type=11';
                return request(myRequest);
            })
            .then(function () {
                myRequest.url = config.baseUrl + '/CSRF-Generate';
                return request(myRequest);
            })
            .then(function (csrfResponse) {
                assert.equal(csrfResponse.statusCode, 200);
                var csrfToken = JSON.parse(csrfResponse.body).csrf.token;
                myRequest.url = config.baseUrl + '/GiftRegistry-CreateRegistry?';
                myRequest.form = fillRegistryForm(csrfToken, addressID4);
                return request(myRequest);
            })
            .then(function (createRegistryResponse) {
                assert.equal(createRegistryResponse.statusCode, 200);
                registryID4 = JSON.parse(createRegistryResponse.body).ID;
                myRequest.url = config.baseUrl + '/ProductList-TogglePublic?ID=' + registryID4 + '&type=11';
                return request(myRequest);
            })
            .then(function () {
                myRequest.url = config.baseUrl + '/CSRF-Generate';
                return request(myRequest);
            })
            .then(function (csrfResponse) {
                assert.equal(csrfResponse.statusCode, 200);
                var csrfToken = JSON.parse(csrfResponse.body).csrf.token;
                myRequest.url = config.baseUrl + '/GiftRegistry-CreateRegistry?';
                myRequest.form = fillRegistryForm(csrfToken, addressID5);
                return request(myRequest);
            })
            .then(function (createRegistryResponse) {
                assert.equal(createRegistryResponse.statusCode, 200);
                registryID5 = JSON.parse(createRegistryResponse.body).ID;
                myRequest.url = config.baseUrl + '/ProductList-TogglePublic?ID=' + registryID5 + '&type=11';
                return request(myRequest);
            })
            .then(function () {
                myRequest.url = config.baseUrl + '/CSRF-Generate';
                return request(myRequest);
            })
            .then(function (csrfResponse) {
                assert.equal(csrfResponse.statusCode, 200);
                var csrfToken = JSON.parse(csrfResponse.body).csrf.token;
                myRequest.url = config.baseUrl + '/GiftRegistry-CreateRegistry?';
                myRequest.form = fillRegistryForm(csrfToken, addressID6);
                return request(myRequest);
            })
            .then(function (createRegistryResponse) {
                assert.equal(createRegistryResponse.statusCode, 200);
                registryID6 = JSON.parse(createRegistryResponse.body).ID;
                myRequest.url = config.baseUrl + '/ProductList-TogglePublic?ID=' + registryID6 + '&type=11';
                return request(myRequest);
            })
            .then(function () {
                myRequest.url = config.baseUrl + '/CSRF-Generate';
                return request(myRequest);
            })
            .then(function (csrfResponse) {
                assert.equal(csrfResponse.statusCode, 200);
                var csrfToken = JSON.parse(csrfResponse.body).csrf.token;
                myRequest.url = config.baseUrl + '/GiftRegistry-CreateRegistry?';
                myRequest.form = fillRegistryForm(csrfToken, addressID7);
                return request(myRequest);
            })
            .then(function (createRegistryResponse) {
                assert.equal(createRegistryResponse.statusCode, 200);
                registryID7 = JSON.parse(createRegistryResponse.body).ID;
                myRequest.url = config.baseUrl + '/ProductList-TogglePublic?ID=' + registryID7 + '&type=11';
                return request(myRequest);
            })
            .then(function () {
                myRequest.url = config.baseUrl + '/CSRF-Generate';
                return request(myRequest);
            })
            .then(function (csrfResponse) {
                assert.equal(csrfResponse.statusCode, 200);
                var csrfToken = JSON.parse(csrfResponse.body).csrf.token;
                myRequest.url = config.baseUrl + '/GiftRegistry-CreateRegistry?';
                myRequest.form = fillRegistryForm(csrfToken, addressID8);
                return request(myRequest);
            })
            .then(function (createRegistryResponse) {
                assert.equal(createRegistryResponse.statusCode, 200);
                registryID8 = JSON.parse(createRegistryResponse.body).ID;
                myRequest.url = config.baseUrl + '/ProductList-TogglePublic?ID=' + registryID8 + '&type=11';
                return request(myRequest);
            })
            .then(function () {
                myRequest.url = config.baseUrl + '/CSRF-Generate';
                return request(myRequest);
            })
            .then(function (csrfResponse) {
                assert.equal(csrfResponse.statusCode, 200);
                var csrfToken = JSON.parse(csrfResponse.body).csrf.token;
                myRequest.url = config.baseUrl + '/GiftRegistry-CreateRegistry?';
                myRequest.form = fillRegistryForm(csrfToken, addressID9);
                return request(myRequest);
            })
            .then(function (createRegistryResponse) {
                assert.equal(createRegistryResponse.statusCode, 200);
                registryID9 = JSON.parse(createRegistryResponse.body).ID;
                myRequest.url = config.baseUrl + '/ProductList-TogglePublic?ID=' + registryID9 + '&type=11';
                return request(myRequest);
            });
    });

    after(function () {
        var myRequestAfter = {
            url: config.baseUrl + '/GiftRegistry-RemoveList?id=' + registryID,
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
                myRequestAfter.url = config.baseUrl + '/GiftRegistry-RemoveList?id=' + registryID2;
                return request(myRequestAfter);
            })
            .then(function (responseAfter) {
                assert.equal(responseAfter.statusCode, 200);
                myRequestAfter.url = config.baseUrl + '/Address-DeleteAddress?addressId=' + addressID2 + '&isDefault=false';
                return request(myRequestAfter);
            })
            .then(function (responseAfter) {
                assert.equal(responseAfter.statusCode, 200);
                myRequestAfter.url = config.baseUrl + '/GiftRegistry-RemoveList?id=' + registryID3;
                return request(myRequestAfter);
            })
            .then(function (responseAfter) {
                assert.equal(responseAfter.statusCode, 200);
                myRequestAfter.url = config.baseUrl + '/Address-DeleteAddress?addressId=' + addressID3 + '&isDefault=false';
                return request(myRequestAfter);
            })
            .then(function (responseAfter) {
                assert.equal(responseAfter.statusCode, 200);
                myRequestAfter.url = config.baseUrl + '/GiftRegistry-RemoveList?id=' + registryID4;
                return request(myRequestAfter);
            })
            .then(function (responseAfter) {
                assert.equal(responseAfter.statusCode, 200);
                myRequestAfter.url = config.baseUrl + '/Address-DeleteAddress?addressId=' + addressID4 + '&isDefault=false';
                return request(myRequestAfter);
            })
            .then(function (responseAfter) {
                assert.equal(responseAfter.statusCode, 200);
                myRequestAfter.url = config.baseUrl + '/GiftRegistry-RemoveList?id=' + registryID5;
                return request(myRequestAfter);
            })
            .then(function (responseAfter) {
                assert.equal(responseAfter.statusCode, 200);
                myRequestAfter.url = config.baseUrl + '/Address-DeleteAddress?addressId=' + addressID5 + '&isDefault=false';
                return request(myRequestAfter);
            })
            .then(function (responseAfter) {
                assert.equal(responseAfter.statusCode, 200);
                myRequestAfter.url = config.baseUrl + '/GiftRegistry-RemoveList?id=' + registryID6;
                return request(myRequestAfter);
            })
            .then(function (responseAfter) {
                assert.equal(responseAfter.statusCode, 200);
                myRequestAfter.url = config.baseUrl + '/Address-DeleteAddress?addressId=' + addressID6 + '&isDefault=false';
                return request(myRequestAfter);
            })
            .then(function (responseAfter) {
                assert.equal(responseAfter.statusCode, 200);
                myRequestAfter.url = config.baseUrl + '/GiftRegistry-RemoveList?id=' + registryID7;
                return request(myRequestAfter);
            })
            .then(function (responseAfter) {
                assert.equal(responseAfter.statusCode, 200);
                myRequestAfter.url = config.baseUrl + '/Address-DeleteAddress?addressId=' + addressID7 + '&isDefault=false';
                return request(myRequestAfter);
            })
            .then(function (responseAfter) {
                assert.equal(responseAfter.statusCode, 200);
                myRequestAfter.url = config.baseUrl + '/GiftRegistry-RemoveList?id=' + registryID8;
                return request(myRequestAfter);
            })
            .then(function (responseAfter) {
                assert.equal(responseAfter.statusCode, 200);
                myRequestAfter.url = config.baseUrl + '/Address-DeleteAddress?addressId=' + addressID8 + '&isDefault=false';
                return request(myRequestAfter);
            })
            .then(function (responseAfter) {
                assert.equal(responseAfter.statusCode, 200);
                myRequestAfter.url = config.baseUrl + '/GiftRegistry-RemoveList?id=' + registryID9;
                return request(myRequestAfter);
            })
            .then(function (responseAfter) {
                assert.equal(responseAfter.statusCode, 200);
                myRequestAfter.url = config.baseUrl + '/Address-DeleteAddress?addressId=' + addressID9 + '&isDefault=false';
                return request(myRequestAfter);
            })
            .then(function (responseAfter2) {
                assert.equal(responseAfter2.statusCode, 200);
                myRequestAfter.url = config.baseUrl + '/Address-DeleteAddress?addressId=' + addressID1 + '&isDefault=true';
                return request(myRequestAfter);
            });
    });

    it('should get the first page of gr lists', function () {
        var myRequest = {
            url: config.baseUrl + '/GiftRegistry-MoreSearchResults?pageNumber=1&pageSize=8&country=&state=&city=&name=&email=&year=&month=&lastName=WLuser&firstName=WLUser1',
            method: 'GET',
            rejectUnauthorized: false,
            resolveWithFullResponse: true,
            jar: cookieJar,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        };
        return request(myRequest)
            .then(function (response) {
                assert.equal(response.statusCode, 200);
                var responseBody = JSON.parse(response.body);
                assert.equal(responseBody.success, true);
                assert.equal(responseBody.pageNumber, 1);
                assert.equal(responseBody.moreResults, true);
                assert.equal(responseBody.results.total, 9);
                assert.equal(responseBody.results.firstName, 'WLUser1');
                assert.equal(responseBody.results.lastName, 'WLuser');
            });
    });

    it('should get the last page of gr lists', function () {
        var myRequest = {
            url: config.baseUrl + '/GiftRegistry-MoreSearchResults?pageNumber=2&pageSize=8&country=&state=&city=&name=&email=&year=&month=&lastName=WLuser&firstName=WLUser1',
            method: 'GET',
            rejectUnauthorized: false,
            resolveWithFullResponse: true,
            jar: cookieJar,
            form: {
                searchFirstName: 'WLUser1',
                searchLastName: 'WLuser',
                searchEventMonth: undefined,
                searchEventYear: undefined,
                searchGREmail: undefined,
                searchGRName: undefined,
                searchGRCity: undefined,
                searchGRState: undefined,
                searchGRCountry: undefined
            },
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        };
        return request(myRequest)
            .then(function (response) {
                assert.equal(response.statusCode, 200);
                var responseBody = JSON.parse(response.body);
                assert.equal(responseBody.success, true);
                assert.equal(responseBody.pageNumber, 2);
                assert.equal(responseBody.moreResults, false);
                assert.equal(responseBody.results.total, 9);
                assert.equal(responseBody.results.firstName, 'WLUser1');
                assert.equal(responseBody.results.lastName, 'WLuser');
            });
    });
});
