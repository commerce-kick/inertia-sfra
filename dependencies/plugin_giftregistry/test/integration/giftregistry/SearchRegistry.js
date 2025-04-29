'use strict';

var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');
var chai = require('chai');
var chaiSubset = require('chai-subset');
chai.use(chaiSubset);

describe('SearchRegistry - GiftRegistry-Search', function () {
    this.timeout(20000);

    var cookieJar = request.jar();

    // var csrfTokenHolder;

    // var response;
    var registryID1;
    var registryID2;
    var registryID3;

    var user1Email = 'wluser1@demandware.com';
    var user1FName = 'WLUser1';
    var user1LName = 'WLuser';
    var user1Password = 'Test123!';

    var user2Email = 'wluser2@demandware.com';
    var user2FName = 'WLUser2';
    var user2LName = 'WLuser';
    var user2Password = 'Test123!';

    // event variables
    var eventName = 'eventName';
    var event2Name = 'event2Name';
    var event3Name = 'event3Name';
    var eventDate = '07/09/2119';
    var eventCountryCode = 'US';
    var eventState = 'NH';
    var eventCity = 'eventCity';

    // registrants
    var firstNameRegistrant = user1FName;
    var lastNameRegistrant = user1LName;
    var registrantRole = 'registrantRole';
    var registrantEmail = user1Email;

    // addresses
    var addressID1 = 'preShippingTitle';
    var addressID2 = 'preShippingTitle2';
    var addressID3 = 'preShippingTitle3';
    var preAddressFirstName = 'firstName-shipping-pre';
    var preAddressLastName = 'lastName-shipping-pre';
    var preAddress1 = 'address1-shipping-pre';
    var preAddress2 = 'address2-shipping-pre';
    var preAddressCity = 'city-shipping-pre';
    // var preAddressState = 'MA';
    var preAddressZip = '01801';
    var preAddressPhone = '9009009000';

    var getJSONBaseURL = config.baseUrl + '/GiftRegistry-GetListJson?id=';
    var getListJsonRequest = {
        url: getJSONBaseURL,
        method: 'GET',
        rejectUnauthorized: false,
        resolveWithFullResponse: true,
        jar: cookieJar,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    };

    var myCSRFRequest = {
        url: config.baseUrl + '/CSRF-Generate',
        method: 'POST',
        rejectUnauthorized: false,
        resolveWithFullResponse: true,
        jar: cookieJar,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    };

    var testRequest = {
        url: config.baseUrl + '/GiftRegistry-Search',
        method: 'POST',
        rejectUnauthorized: false,
        resolveWithFullResponse: true,
        jar: cookieJar,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        // By default request-promise errors out on non 2xx HTTP responses
        // Some tests fail as sometimes there are 301 redirect responses
        simple: false
    };

    // If your instance has `Enable Storefront URLs` enabled, the request will be redirected
    //      Merchant Tools > Site Preferences > Storefront URL
    // Where the original request URL will look like this:
    //      https://zzrf-032.dx.commercecloud.salesforce.com/on/demandware.store/Sites-RefArch-Site/en_US/GiftRegistry-Search
    // the redirect URL will look like this:
    //      https://zzrf-032.dx.commercecloud.salesforce.com/s/RefArch/giftregistrysearch
    // This happens with a default set up on ODS instances without additional configuration
    // We have to manually follow the redirect because request-promise package
    // doesn't provide the functionality to follow redirect POST requests, only GET
    function followPostRedirect(response) {
        var redirectUrl = response.headers.location.split('?')[0];
        // Create a copy of the original request and update the URL
        var redirectRequest = Object.assign({}, testRequest, {
            url: redirectUrl,
            form: testRequest.form
        });
        return request(redirectRequest);
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

        var myPublicRequest2 = {
            url: config.baseUrl + '/ProductList-TogglePublic',
            method: 'POST',
            rejectUnauthorized: false,
            resolveWithFullResponse: true,
            jar: cookieJar,
            form: {
                listID: '',
                itemID: null
            },
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
                    loginEmail: user1Email,
                    loginPassword: user1Password,
                    csrf_token: csrfToken
                };
                return request(myRequest);
            })
            .then(function (loginResponse) {
                // create a gift registry
                assert.equal(loginResponse.statusCode, 200);
                return request(myCSRFRequest);
            })
            .then(function (csrfResponse2) {
                // submit the form to create a registry
                assert.equal(csrfResponse2.statusCode, 200);
                var csrfJsonResponse2 = JSON.parse(csrfResponse2.body);
                var csrfToken2 = csrfJsonResponse2.csrf.token;
                myRequest.url = config.baseUrl + '/GiftRegistry-CreateRegistry?';
                myRequest.form = {
                    csrf_token: csrfToken2,
                    dwfrm_giftRegistry_giftRegistryEvent_event_eventName: eventName,
                    dwfrm_giftRegistry_giftRegistryEvent_event_eventDate: eventDate,
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
                    dwfrm_giftRegistry_postShippingCheck: false
                };
                return request(myRequest);
            })
            .then(function (createRegistryResponse) {
                assert.equal(createRegistryResponse.statusCode, 200);
                var createRegistryResponseBody = JSON.parse(createRegistryResponse.body);
                registryID1 = createRegistryResponseBody.ID;
                getListJsonRequest.url = getJSONBaseURL + registryID1;

                return request(getListJsonRequest);
            })
            .then(function () {
                myPublicRequest2.form.listID = registryID1;
                return request(myPublicRequest2);
            })
            .then(function () {
                return request(myCSRFRequest);
            })
            .then(function (csrfResponse3) {
                // submit the form to create a registry
                assert.equal(csrfResponse3.statusCode, 200);
                var csrfJsonResponse3 = JSON.parse(csrfResponse3.body);
                var csrfToken3 = csrfJsonResponse3.csrf.token;
                myRequest.url = config.baseUrl + '/GiftRegistry-CreateRegistry?';
                myRequest.form = {
                    csrf_token: csrfToken3,
                    dwfrm_giftRegistry_giftRegistryEvent_event_eventName: event2Name,
                    dwfrm_giftRegistry_giftRegistryEvent_event_eventDate: eventDate,
                    dwfrm_giftRegistry_giftRegistryEvent_event_eventCountry: eventCountryCode,
                    dwfrm_giftRegistry_giftRegistryEvent_event_eventState_stateCode: eventState,
                    dwfrm_giftRegistry_giftRegistryEvent_event_eventCity: eventCity,
                    dwfrm_giftRegistry_giftRegistryEvent_registrant_role: registrantRole,
                    dwfrm_giftRegistry_giftRegistryEvent_registrant_firstName: firstNameRegistrant,
                    dwfrm_giftRegistry_giftRegistryEvent_registrant_lastName: lastNameRegistrant,
                    dwfrm_giftRegistry_giftRegistryEvent_registrant_email: registrantEmail,
                    dwfrm_giftRegistry_coRegistrantCheck: false,
                    grAddressSelector: addressID1,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_addressId: addressID2,
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
                return request(myRequest);
            })
            .then(function (createRegistryResponse) {
                assert.equal(createRegistryResponse.statusCode, 200);
                var createRegistryResponseBody = JSON.parse(createRegistryResponse.body);
                registryID2 = createRegistryResponseBody.ID;
                getListJsonRequest.url = getJSONBaseURL + registryID2;

                return request(getListJsonRequest);
            })
            .then(function () {
                myPublicRequest2.form.listID = registryID2;
                return request(myPublicRequest2);
            })
            .then(function () {
                return request(myCSRFRequest);
            })
            .then(function (createRegistryResponse) {
                assert.equal(createRegistryResponse.statusCode, 200);
                myRequest.method = 'GET';
                myRequest.url = config.baseUrl + '/Login-Logout';
                return request(myRequest);
            })
            .then(function (createRegistryResponse) {
                assert.equal(createRegistryResponse.statusCode, 200);
                return request(myCSRFRequest);
            })
            .then(function (csrfResponse4) {
                assert.equal(csrfResponse4.statusCode, 200);
                var csrfJsonResponse4 = JSON.parse(csrfResponse4.body);
                var csrfToken4 = csrfJsonResponse4.csrf.token;
                myRequest.url = config.baseUrl + '/Account-Login?' + csrfJsonResponse4.csrf.tokenName + '=' + csrfToken4;
                myRequest.method = 'POST';
                myRequest.form = {
                    loginEmail: user2Email,
                    loginPassword: user2Password,
                    csrf_token: csrfToken4
                };
                return request(myRequest);
            })
            .then(function (loginResponse) {
                // create a gift registry
                assert.equal(loginResponse.statusCode, 200);
                return request(myCSRFRequest);
            })
            .then(function (csrfResponse5) {
                assert.equal(csrfResponse5.statusCode, 200);
                var csrfJsonResponse5 = JSON.parse(csrfResponse5.body);
                var csrfToken5 = csrfJsonResponse5.csrf.token;
                myRequest.url = config.baseUrl + '/GiftRegistry-CreateRegistry?';
                myRequest.form = {
                    csrf_token: csrfToken5,
                    dwfrm_giftRegistry_giftRegistryEvent_event_eventName: event3Name,
                    dwfrm_giftRegistry_giftRegistryEvent_event_eventDate: eventDate,
                    dwfrm_giftRegistry_giftRegistryEvent_event_eventCountry: eventCountryCode,
                    dwfrm_giftRegistry_giftRegistryEvent_event_eventState_stateCode: eventState,
                    dwfrm_giftRegistry_giftRegistryEvent_event_eventCity: eventCity,
                    dwfrm_giftRegistry_giftRegistryEvent_registrant_role: registrantRole,
                    dwfrm_giftRegistry_giftRegistryEvent_registrant_firstName: firstNameRegistrant,
                    dwfrm_giftRegistry_giftRegistryEvent_registrant_lastName: lastNameRegistrant,
                    dwfrm_giftRegistry_giftRegistryEvent_registrant_email: registrantEmail,
                    dwfrm_giftRegistry_coRegistrantCheck: false,
                    grAddressSelector: addressID1,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_addressId: addressID3,
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
                return request(myRequest);
            })
            .then(function (createRegistryResponse) {
                assert.equal(createRegistryResponse.statusCode, 200);
                var createRegistryResponseBody = JSON.parse(createRegistryResponse.body);
                registryID3 = createRegistryResponseBody.ID;
                getListJsonRequest.url = getJSONBaseURL + registryID3;
                return request(getListJsonRequest);
            })

            .then(function () {
                myPublicRequest2.form.listID = registryID3;
                return request(myPublicRequest2);
            })
            .then(function () {
                return request(myCSRFRequest);
            })
            .then(function () {
                myRequest.method = 'GET';
                myRequest.url = config.baseUrl + '/Login-Logout';
                return request(myRequest);
            });
    });

    // Sometimes tests fail with a 403 `ACCESS DENIED` if subsequent requests are made too quickly
    beforeEach(function (done) {
        setTimeout(done, 500);
    });

    after(function () {
        var myRequestAfter = {
            url: '',
            method: 'POST',
            rejectUnauthorized: false,
            resolveWithFullResponse: true,
            jar: cookieJar,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        };
        return request(myCSRFRequest)
            .then(function (csrfResponse) {
                // Log in to the storefront
                assert.equal(csrfResponse.statusCode, 200);
                var csrfJsonResponse = JSON.parse(csrfResponse.body);
                var csrfToken = csrfJsonResponse.csrf.token;
                myRequestAfter.url = config.baseUrl + '/Account-Login?' + csrfJsonResponse.csrf.tokenName + '=' + csrfToken;
                myRequestAfter.form = {
                    loginEmail: user2Email,
                    loginPassword: user2Password,
                    csrf_token: csrfToken
                };
                return request(myRequestAfter);
            })
            .then(function (responseAfter2) {
                assert.equal(responseAfter2.statusCode, 200);
                myRequestAfter.url = config.baseUrl + '/GiftRegistry-RemoveList?id=' + registryID3;
                myRequestAfter.method = 'GET';
                return request(myRequestAfter);
            })
            .then(function (responseAfter) {
                assert.equal(responseAfter.statusCode, 200);
                myRequestAfter.method = 'GET';
                myRequestAfter.url = config.baseUrl + '/Address-DeleteAddress?addressId=' + addressID3 + '&isDefault=true';
                return request(myRequestAfter);
            })
            .then(function () {
                myRequestAfter.method = 'GET';
                myRequestAfter.url = config.baseUrl + '/Login-Logout';
                return request(myRequestAfter);
            })
            .then(function (responseAfter2) {
                assert.equal(responseAfter2.statusCode, 200);
                myRequestAfter.method = 'POST';
                return request(myCSRFRequest);
            })
            .then(function (responseAfter2) {
                assert.equal(responseAfter2.statusCode, 200);
                myRequestAfter.method = 'POST';

                var csrfJsonResponse = JSON.parse(responseAfter2.body);
                var csrfToken = csrfJsonResponse.csrf.token;
                myRequestAfter.url = config.baseUrl + '/Account-Login?' + csrfJsonResponse.csrf.tokenName + '=' + csrfToken;
                myRequestAfter.form = {
                    loginEmail: user1Email,
                    loginPassword: user1Password,
                    csrf_token: csrfToken
                };
                return request(myRequestAfter);
            })
            .then(function (responseAfter2) {
                assert.equal(responseAfter2.statusCode, 200);
                myRequestAfter.url = config.baseUrl + '/GiftRegistry-RemoveList?id=' + registryID2;
                myRequestAfter.method = 'GET';
                return request(myRequestAfter);
            })
            .then(function (responseAfter2) {
                assert.equal(responseAfter2.statusCode, 200);
                myRequestAfter.url = config.baseUrl + '/GiftRegistry-RemoveList?id=' + registryID1;
                myRequestAfter.method = 'GET';
                return request(myRequestAfter);
            })
            .then(function (responseAfter) {
                assert.equal(responseAfter.statusCode, 200);
                myRequestAfter.method = 'GET';
                myRequestAfter.url = config.baseUrl + '/Address-DeleteAddress?addressId=' + addressID2 + '&isDefault=false';
                return request(myRequestAfter);
            })
            .then(function (responseAfter) {
                assert.equal(responseAfter.statusCode, 200);
                myRequestAfter.method = 'GET';
                myRequestAfter.url = config.baseUrl + '/Address-DeleteAddress?addressId=' + addressID1 + '&isDefault=true';
                return request(myRequestAfter);
            })

            .then(function (responseAfter2) {
                assert.equal(responseAfter2.statusCode, 200);
            });
    });

    it('should return 0 results with the wrong name combination', function () {
        var incorrectFirstName = 'dfghj';
        var incorrectLastName = 'erf4tw';
        testRequest.form = {
            searchFirstName: incorrectFirstName,
            searchLastName: incorrectLastName,
            searchEventMonth: undefined,
            searchEventYear: undefined,
            searchGREmail: undefined,
            searchGRName: undefined,
            searchGRCity: undefined,
            searchGRState: undefined,
            searchGRCountry: undefined
        };

        return request(testRequest)
            .then(function (getListJsonRequest) { // eslint-disable-line no-shadow
                if (getListJsonRequest.statusCode === 301) {
                    return followPostRedirect(getListJsonRequest);
                }
                return getListJsonRequest;
            }).then(function (searchResponse) {
                var results = JSON.parse(searchResponse.body).results;
                assert.equal(results.hits.length, 0);
                assert.equal(results.firstName, incorrectFirstName);
                assert.equal(results.lastName, incorrectLastName);
            });
    });

    it('should return 2 results with the correct first and last name', function () {
        testRequest.form = {
            searchFirstName: user1FName,
            searchLastName: user1LName,
            searchEventMonth: undefined,
            searchEventYear: undefined,
            searchGREmail: undefined,
            searchGRName: undefined,
            searchGRCity: undefined,
            searchGRState: undefined,
            searchGRCountry: undefined
        };

        return request(testRequest)
            .then(function (getListJsonRequest) { // eslint-disable-line no-shadow
                if (getListJsonRequest.statusCode === 301) {
                    return followPostRedirect(getListJsonRequest);
                }
                return getListJsonRequest;
            }).then(function (searchResponse) {
                var results = JSON.parse(searchResponse.body).results;
                assert.equal(results.hits.length, 2);
                assert.equal(results.firstName, user1FName);
                assert.equal(results.lastName, user1LName);
            });
    });

    it('should return 2 results with the correct first and last name and correct email', function () {
        testRequest.form = {
            searchFirstName: user1FName,
            searchLastName: user1LName,
            searchEventMonth: undefined,
            searchEventYear: undefined,
            searchGREmail: user1Email,
            searchGRName: undefined,
            searchGRCity: undefined,
            searchGRState: undefined,
            searchGRCountry: undefined
        };

        return request(testRequest)
            .then(function (getListJsonRequest) { // eslint-disable-line no-shadow
                if (getListJsonRequest.statusCode === 301) {
                    return followPostRedirect(getListJsonRequest);
                }
                return getListJsonRequest;
            }).then(function (searchResponse) {
                var results = JSON.parse(searchResponse.body).results;
                assert.equal(results.hits.length, 2);
                assert.equal(results.firstName, user1FName);
                assert.equal(results.lastName, user1LName);
            });
    });

    it('should return 1 result with the correct first and last name and event1', function () {
        testRequest.form = {
            searchFirstName: user1FName,
            searchLastName: user1LName,
            searchEventMonth: undefined,
            searchEventYear: undefined,
            searchGREmail: undefined,
            searchGRName: eventName,
            searchGRCity: undefined,
            searchGRState: undefined,
            searchGRCountry: undefined
        };

        return request(testRequest)
            .then(function (getListJsonRequest) { // eslint-disable-line no-shadow
                if (getListJsonRequest.statusCode === 301) {
                    return followPostRedirect(getListJsonRequest);
                }
                return getListJsonRequest;
            }).then(function (searchResponse) {
                var results = JSON.parse(searchResponse.body).results;
                assert.equal(results.hits.length, 1);
                assert.equal(results.firstName, user1FName);
                assert.equal(results.lastName, user1LName);
            });
    });

    it('should return 1 result with the correct first and last name and event2', function () {
        testRequest.form = {
            searchFirstName: user1FName,
            searchLastName: user1LName,
            searchEventMonth: undefined,
            searchEventYear: undefined,
            searchGREmail: undefined,
            searchGRName: event2Name,
            searchGRCity: undefined,
            searchGRState: undefined,
            searchGRCountry: undefined
        };

        return request(testRequest)
            .then(function (getListJsonRequest) { // eslint-disable-line no-shadow
                if (getListJsonRequest.statusCode === 301) {
                    return followPostRedirect(getListJsonRequest);
                }
                return getListJsonRequest;
            }).then(function (searchResponse) {
                var results = JSON.parse(searchResponse.body).results;
                assert.equal(results.hits.length, 1);
                assert.equal(results.firstName, user1FName);
                assert.equal(results.lastName, user1LName);
            });
    });

    it('should return 0 results with the correct first and last name and event3', function () {
        testRequest.form = {
            searchFirstName: user1FName,
            searchLastName: user1LName,
            searchEventMonth: undefined,
            searchEventYear: undefined,
            searchGREmail: undefined,
            searchGRName: event3Name,
            searchGRCity: undefined,
            searchGRState: undefined,
            searchGRCountry: undefined
        };

        return request(testRequest)
            .then(function (getListJsonRequest) { // eslint-disable-line no-shadow
                if (getListJsonRequest.statusCode === 301) {
                    return followPostRedirect(getListJsonRequest);
                }
                return getListJsonRequest;
            }).then(function (searchResponse) {
                var results = JSON.parse(searchResponse.body).results;
                assert.equal(results.hits.length, 0);
                assert.equal(results.firstName, user1FName);
                assert.equal(results.lastName, user1LName);
            });
    });

    it('should return 0 results with the correct first and last name and incorrect email', function () {
        testRequest.form = {
            searchFirstName: user1FName,
            searchLastName: user1LName,
            searchEventMonth: undefined,
            searchEventYear: undefined,
            searchGREmail: 'user1@Email.com',
            searchGRName: undefined,
            searchGRCity: undefined,
            searchGRState: undefined,
            searchGRCountry: undefined
        };

        return request(testRequest)
            .then(function (getListJsonRequest) { // eslint-disable-line no-shadow
                if (getListJsonRequest.statusCode === 301) {
                    return followPostRedirect(getListJsonRequest);
                }
                return getListJsonRequest;
            }).then(function (searchResponse) {
                var results = JSON.parse(searchResponse.body).results;
                assert.equal(results.hits.length, 0);
                assert.equal(results.firstName, user1FName);
                assert.equal(results.lastName, user1LName);
            });
    });

    it('should return 1 result with the correct first and last name', function () {
        testRequest.form = {
            searchFirstName: user2FName,
            searchLastName: user2LName,
            searchEventMonth: undefined,
            searchEventYear: undefined,
            searchGREmail: undefined,
            searchGRName: undefined,
            searchGRCity: undefined,
            searchGRState: undefined,
            searchGRCountry: undefined
        };
        return request(testRequest)
            .then(function (getListJsonRequest) { // eslint-disable-line no-shadow
                if (getListJsonRequest.statusCode === 301) {
                    return followPostRedirect(getListJsonRequest);
                }
                return getListJsonRequest;
            }).then(function (searchResponse) {
                var results = JSON.parse(searchResponse.body).results;
                assert.equal(results.hits.length, 1);
                assert.equal(results.firstName, user2FName);
                assert.equal(results.lastName, user2LName);
            });
    });

    it('should return 1 result with the correct first and last name and month', function () {
        testRequest.form = {
            searchFirstName: user2FName,
            searchLastName: user2LName,
            searchEventMonth: 7,
            searchEventYear: undefined,
            searchGREmail: undefined,
            searchGRName: undefined,
            searchGRCity: undefined,
            searchGRState: undefined,
            searchGRCountry: undefined
        };
        return request(testRequest)
            .then(function (getListJsonRequest) { // eslint-disable-line no-shadow
                if (getListJsonRequest.statusCode === 301) {
                    return followPostRedirect(getListJsonRequest);
                }
                return getListJsonRequest;
            }).then(function (searchResponse) {
                var results = JSON.parse(searchResponse.body).results;
                assert.equal(results.hits.length, 1);
                assert.equal(results.firstName, user2FName);
                assert.equal(results.lastName, user2LName);
            });
    });

    it('should return 0 results with the correct first and last name and incorrect month', function () {
        testRequest.form = {
            searchFirstName: user2FName,
            searchLastName: user2LName,
            searchEventMonth: 8,
            searchEventYear: undefined,
            searchGREmail: undefined,
            searchGRName: undefined,
            searchGRCity: undefined,
            searchGRState: undefined,
            searchGRCountry: undefined
        };
        return request(testRequest)
            .then(function (getListJsonRequest) { // eslint-disable-line no-shadow
                if (getListJsonRequest.statusCode === 301) {
                    return followPostRedirect(getListJsonRequest);
                }
                return getListJsonRequest;
            }).then(function (searchResponse) {
                var results = JSON.parse(searchResponse.body).results;
                assert.equal(results.hits.length, 0);
            });
    });

    it('should return 1 result with the correct first and last name and year', function () {
        testRequest.form = {
            searchFirstName: user2FName,
            searchLastName: user2LName,
            searchEventMonth: undefined,
            searchEventYear: 2119,
            searchGREmail: undefined,
            searchGRName: undefined,
            searchGRCity: undefined,
            searchGRState: undefined,
            searchGRCountry: undefined
        };
        return request(testRequest)
            .then(function (getListJsonRequest) { // eslint-disable-line no-shadow
                if (getListJsonRequest.statusCode === 301) {
                    return followPostRedirect(getListJsonRequest);
                }
                return getListJsonRequest;
            }).then(function (searchResponse) {
                var results = JSON.parse(searchResponse.body).results;
                assert.equal(results.hits.length, 1);
                assert.equal(results.firstName, user2FName);
                assert.equal(results.lastName, user2LName);
            });
    });

    it('should return 0 results with the correct first and last name and incorrect year', function () {
        testRequest.form = {
            searchFirstName: user2FName,
            searchLastName: user2LName,
            searchEventMonth: undefined,
            searchEventYear: 3000,
            searchGREmail: undefined,
            searchGRName: undefined,
            searchGRCity: undefined,
            searchGRState: undefined,
            searchGRCountry: undefined
        };
        return request(testRequest)
            .then(function (getListJsonRequest) { // eslint-disable-line no-shadow
                if (getListJsonRequest.statusCode === 301) {
                    return followPostRedirect(getListJsonRequest);
                }
                return getListJsonRequest;
            }).then(function (searchResponse) {
                var results = JSON.parse(searchResponse.body).results;
                assert.equal(results.hits.length, 0);
            });
    });

    it('should return 1 result with the correct first and last name and event city', function () {
        testRequest.form = {
            searchFirstName: user2FName,
            searchLastName: user2LName,
            searchEventMonth: undefined,
            searchEventYear: undefined,
            searchGREmail: undefined,
            searchGRName: undefined,
            searchGRCity: eventCity,
            searchGRState: undefined,
            searchGRCountry: undefined
        };
        return request(testRequest)
            .then(function (getListJsonRequest) { // eslint-disable-line no-shadow
                if (getListJsonRequest.statusCode === 301) {
                    return followPostRedirect(getListJsonRequest);
                }
                return getListJsonRequest;
            }).then(function (searchResponse) {
                var results = JSON.parse(searchResponse.body).results;
                assert.equal(results.hits.length, 1);
                assert.equal(results.firstName, user2FName);
                assert.equal(results.lastName, user2LName);
            });
    });

    it('should return 0 results with the correct first and last name and incorrect event city', function () {
        testRequest.form = {
            searchFirstName: user2FName,
            searchLastName: user2LName,
            searchEventMonth: undefined,
            searchEventYear: undefined,
            searchGREmail: undefined,
            searchGRName: undefined,
            searchGRCity: 'wrongEventCity',
            searchGRState: undefined,
            searchGRCountry: undefined
        };
        return request(testRequest)
            .then(function (getListJsonRequest) { // eslint-disable-line no-shadow
                if (getListJsonRequest.statusCode === 301) {
                    return followPostRedirect(getListJsonRequest);
                }
                return getListJsonRequest;
            }).then(function (searchResponse) {
                var results = JSON.parse(searchResponse.body).results;
                assert.equal(results.hits.length, 0);
            });
    });

    it('should return 1 result with the correct first and last name and event state', function () {
        testRequest.form = {
            searchFirstName: user2FName,
            searchLastName: user2LName,
            searchEventMonth: undefined,
            searchEventYear: undefined,
            searchGREmail: undefined,
            searchGRName: undefined,
            searchGRCity: undefined,
            searchGRState: eventState,
            searchGRCountry: undefined
        };
        return request(testRequest)
            .then(function (getListJsonRequest) { // eslint-disable-line no-shadow
                if (getListJsonRequest.statusCode === 301) {
                    return followPostRedirect(getListJsonRequest);
                }
                return getListJsonRequest;
            }).then(function (searchResponse) {
                var results = JSON.parse(searchResponse.body).results;
                assert.equal(results.hits.length, 1);
                assert.equal(results.firstName, user2FName);
                assert.equal(results.lastName, user2LName);
            });
    });

    it('should return 0 results with the correct first and last name and incorrect event state', function () {
        testRequest.form = {
            searchFirstName: user2FName,
            searchLastName: user2LName,
            searchEventMonth: undefined,
            searchEventYear: undefined,
            searchGREmail: undefined,
            searchGRName: undefined,
            searchGRCity: undefined,
            searchGRState: 'MA',
            searchGRCountry: undefined
        };
        return request(testRequest)
            .then(function (getListJsonRequest) { // eslint-disable-line no-shadow
                if (getListJsonRequest.statusCode === 301) {
                    return followPostRedirect(getListJsonRequest);
                }
                return getListJsonRequest;
            }).then(function (searchResponse) {
                var results = JSON.parse(searchResponse.body).results;
                assert.equal(results.hits.length, 0);
            });
    });

    it('should return 1 result with the correct first and last name and event country', function () {
        testRequest.form = {
            searchFirstName: user2FName,
            searchLastName: user2LName,
            searchEventMonth: undefined,
            searchEventYear: undefined,
            searchGREmail: undefined,
            searchGRName: undefined,
            searchGRCity: undefined,
            searchGRState: undefined,
            searchGRCountry: 'US'
        };
        return request(testRequest)
            .then(function (getListJsonRequest) { // eslint-disable-line no-shadow
                if (getListJsonRequest.statusCode === 301) {
                    return followPostRedirect(getListJsonRequest);
                }
                return getListJsonRequest;
            }).then(function (searchResponse) {
                var results = JSON.parse(searchResponse.body).results;
                assert.equal(results.hits.length, 1);
                assert.equal(results.firstName, user2FName);
                assert.equal(results.lastName, user2LName);
            });
    });

    it('should return 0 results with the correct first and last name and incorrect event country', function () {
        testRequest.form = {
            searchFirstName: user2FName,
            searchLastName: user2LName,
            searchEventMonth: undefined,
            searchEventYear: undefined,
            searchGREmail: undefined,
            searchGRName: undefined,
            searchGRCity: undefined,
            searchGRState: undefined,
            searchGRCountry: 'MZ'
        };
        return request(testRequest)
            .then(function (getListJsonRequest) { // eslint-disable-line no-shadow
                if (getListJsonRequest.statusCode === 301) {
                    return followPostRedirect(getListJsonRequest);
                }
                return getListJsonRequest;
            }).then(function (searchResponse) {
                var results = JSON.parse(searchResponse.body).results;
                assert.equal(results.hits.length, 0);
            });
    });

    it('should return 0 results with no entries from the form', function () {
        testRequest.form = {
            searchFirstName: undefined,
            searchLastName: undefined,
            searchEventMonth: undefined,
            searchEventYear: undefined,
            searchGREmail: undefined,
            searchGRName: undefined,
            searchGRCity: undefined,
            searchGRState: undefined,
            searchGRCountry: undefined
        };
        return request(testRequest)
            .then(function (getListJsonRequest) { // eslint-disable-line no-shadow
                if (getListJsonRequest.statusCode === 301) {
                    return followPostRedirect(getListJsonRequest);
                }
                return getListJsonRequest;
            }).then(function (searchResponse) {
                var results = JSON.parse(searchResponse.body).results;
                assert.equal(Object.keys(results).length, 0);
            });
    });
});
