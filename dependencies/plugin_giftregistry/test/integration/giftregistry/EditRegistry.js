'use strict';

var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');
var chai = require('chai');
var chaiSubset = require('chai-subset');
chai.use(chaiSubset);

describe('EditRegistry - GiftRegistry-Edit', function () {
    this.timeout(5000);

    var cookieJar = request.jar();
    var registryID;
    var csrfTokenHolder;

    var response;

    // event variables
    var eventName = 'eventName';
    var eventDate = '07/09/2019';
    var eventCountryCode = 'US';
    var eventState = 'NH';
    var eventCity = 'eventCity';
    var EventNameEdited = 'EventNameX';
    var eventDateEdited = '2019-09-07T00:00:00.000Z';
    var eventDateObjEdited = {
        d: '07',
        m: '09',
        y: '2019'
    };

    var eventCountryCodeEdited = eventCountryCode;
    var eventStateEdited = 'MA';
    var eventCityEdited = 'eventCityX';

    // registrants
    var firstNameRegistrant = 'registrantFirstName';
    var lastNameRegistrant = 'registrantLastName';
    var registrantRole = 'registrantRole';
    var registrantEmail = 'someone@somewhere.com';
    var firstNameRegistrantEdited = 'registrantLastName-A';
    var lastNameRegistrantEdited = 'registrantFirstName-A';
    var registrantRoleEdited = 'registrantRole-A';
    var registrantEmailEdited = 'someoneElse@somewhere.com';

    var firstNameCoRegistrant = 'coRegistrantFirstName';
    var lastNameCoRegistrant = 'coRegistrantLastName';
    var coRegistrantRole = 'coRegistrantRole';
    var coRegistrantEmail = 'someone2@somewhere.com';
    var firstNameCoRegistrantEdited = 'coRegistrantFirstName-A';
    var lastNameCoRegistrantEdited = 'coRegistrantLastName-A';
    var coRegistrantRoleEdited = 'coRegistrantRole-A';
    var coRegistrantEmailEdited = 'someoneElse2@somewhere.com';

    // addresses
    var address1UUID;
    var addressID1 = 'preShippingTitle';
    var preAddressFirstName = 'firstName-shipping-pre';
    var preAddressLastName = 'lastName-shipping-pre';
    var preAddress1 = 'address1-shipping-pre';
    var preAddress2 = 'address2-shipping-pre';
    var preAddressCity = 'city-shipping-pre';
    var preAddressState = 'MA';
    var preAddressZip = '01801';
    var preAddressPhone = '9009009000';

    var addressID1Edited = 'preShippingTitle-x';
    var preAddressFirstNameEdited = 'firstName-shipping-pre-x';
    var preAddressLastNameEdited = 'lastName-shipping-pre-x';
    var preAddress1Edited = 'address1-shipping-pre-x';
    var preAddress2Edited = 'address2-shipping-pre-x';
    var preAddressCityEdited = 'city-shipping-pre-x';
    var preAddressStateEdited = 'NH';
    var preAddressZipEdited = '01802';
    var preAddressPhoneEdited = '9009009001';

    var addressID2 = 'postShippingTitle';
    var postAddressFirstName = 'firstName-shipping-post';
    var postAddressLastName = 'lastName-shipping-post';
    var postAddress1 = 'address1-shipping-post';
    var postAddress2 = 'address2-shipping-post';
    var postAddressCity = 'city-shipping-post';
    var postAddressState = 'VA';
    var postAddressZip = '90210';
    var postAddressPhone = '1001001000';

    var getListJsonRequest = {
        url: config.baseUrl + '/GiftRegistry-GetListJson?id=',
        method: 'GET',
        rejectUnauthorized: false,
        resolveWithFullResponse: true,
        jar: cookieJar,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    };

    var generateCsrfToken = {
        url: config.baseUrl + '/CSRF-Generate',
        method: 'POST',
        rejectUnauthorized: false,
        resolveWithFullResponse: true,
        jar: cookieJar,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    };

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
                registryID = createRegistryResponseBody.ID;
                getListJsonRequest.url += registryID;

                return request(getListJsonRequest);
            })
            .then(function (listJsonResponse) {
                var createRegistryResponseBody = JSON.parse(listJsonResponse.body);
                address1UUID = createRegistryResponseBody.list.preEventShippingAddress.uuid;
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
                myRequestAfter.url = config.baseUrl + '/Address-DeleteAddress?addressId=' + addressID2 + '&isDefault=false';
                return request(myRequestAfter);
            })
            .then(function (responseAfter2) {
                assert.equal(responseAfter2.statusCode, 200);
                myRequestAfter.url = config.baseUrl + '/Address-DeleteAddress?addressId=' + addressID1Edited + '&isDefault=true';
                return request(myRequestAfter);
            });
    });

    it('should edit the event information', function () {
        return request(getListJsonRequest)
            .then(function (getListJsonRequest) { // eslint-disable-line no-shadow
                var responseList = JSON.parse(getListJsonRequest.body).list;
                assert.equal(eventName, responseList.name);
                assert.equal(eventCountryCode, responseList.eventInfo.country);
                assert.equal(eventState, responseList.eventInfo.state);
                assert.equal(eventCity, responseList.eventInfo.city);
                return request(generateCsrfToken);
            })
            .then(function (editRegistryResponseCsrf) {
                csrfTokenHolder = JSON.parse(editRegistryResponseCsrf.body).csrf.token;
                var editRegistryRequest = {
                    url: config.baseUrl + '/GiftRegistry-Edit',
                    method: 'POST',
                    rejectUnauthorized: false,
                    resolveWithFullResponse: true,
                    jar: cookieJar,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                };

                editRegistryRequest.form = {
                    csrf_token: csrfTokenHolder,
                    dwfrm_giftRegistry_giftRegistryEvent_event_eventName: EventNameEdited,
                    dwfrm_giftRegistry_giftRegistryEvent_event_eventDate: '09/07/2019',
                    dwfrm_giftRegistry_giftRegistryEvent_event_eventCountry: eventCountryCodeEdited,
                    dwfrm_giftRegistry_giftRegistryEvent_event_eventState_stateCode: eventStateEdited,
                    dwfrm_giftRegistry_giftRegistryEvent_event_eventCity: eventCityEdited,
                    eventFormType: 'event',
                    registryID: registryID
                };
                return request(editRegistryRequest);
            })
            .then(function (editRegistryResponse) {
                assert.equal(editRegistryResponse.statusCode, 200);
                return request(getListJsonRequest);
            })
            .then(function (editeventResponseAsserts) {
                assert.equal(editeventResponseAsserts.statusCode, 200);
                response = JSON.parse(editeventResponseAsserts.body);
                assert.equal(response.list.name, EventNameEdited);
                assert.equal(response.success, true);
                assert.equal(response.list.eventInfo.country, eventCountryCodeEdited);
                assert.equal(response.list.eventInfo.state, eventStateEdited);
                assert.equal(response.list.eventInfo.city, eventCityEdited);
                assert.equal(response.list.eventInfo.date, eventDateEdited);
                assert.equal(response.list.eventInfo.dateObj.d, eventDateObjEdited.d);
                assert.equal(response.list.eventInfo.dateObj.m, eventDateObjEdited.m);
                assert.equal(response.list.eventInfo.dateObj.y, eventDateObjEdited.y);
            });
    });

    it('should edit the registrant information', function () {
        return request(getListJsonRequest)
            .then(function (getListJsonRequest) { // eslint-disable-line no-shadow
                var responseList = JSON.parse(getListJsonRequest.body).list;
                assert.equal(firstNameRegistrant, responseList.registrant.firstName);
                assert.equal(lastNameRegistrant, responseList.registrant.lastName);
                assert.equal(registrantRole, responseList.registrant.role);
                assert.equal(registrantEmail, responseList.registrant.email);
                return request(generateCsrfToken);
            })
            .then(function (EditRole1ResponseCsrf) {
                csrfTokenHolder = JSON.parse(EditRole1ResponseCsrf.body).csrf.token;
                var EditRole1Request = {
                    url: config.baseUrl + '/GiftRegistry-Edit',
                    method: 'POST',
                    rejectUnauthorized: false,
                    resolveWithFullResponse: true,
                    jar: cookieJar,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                };

                EditRole1Request.form = {
                    csrf_token: csrfTokenHolder,
                    dwfrm_giftRegistry_giftRegistryEvent_registrant_role: registrantRoleEdited,
                    dwfrm_giftRegistry_giftRegistryEvent_registrant_firstName: firstNameRegistrantEdited,
                    dwfrm_giftRegistry_giftRegistryEvent_registrant_lastName: lastNameRegistrantEdited,
                    dwfrm_giftRegistry_giftRegistryEvent_registrant_email: registrantEmailEdited,
                    eventFormType: 'registrant',
                    registryID: registryID
                };
                return request(EditRole1Request);
            })
            .then(function (EditRole1Response) {
                assert.equal(EditRole1Response.statusCode, 200);
                return request(getListJsonRequest);
            })
            .then(function (EditRole1ResponseAsserts) {
                assert.equal(EditRole1ResponseAsserts.statusCode, 200);
                response = JSON.parse(EditRole1ResponseAsserts.body);
                assert.equal(response.success, true);
                assert.equal(response.list.registrant.firstName, firstNameRegistrantEdited);
                assert.equal(response.list.registrant.lastName, lastNameRegistrantEdited);
                assert.equal(response.list.registrant.role, registrantRoleEdited);
                assert.equal(response.list.registrant.email, registrantEmailEdited);
            });
    });

    it('should add the co-registrant information', function () {
        return request(generateCsrfToken)
            .then(function (EditRole2ResponseCsrf) {
                csrfTokenHolder = JSON.parse(EditRole2ResponseCsrf.body).csrf.token;
                var EditRole2Request = {
                    url: config.baseUrl + '/GiftRegistry-Edit',
                    method: 'POST',
                    rejectUnauthorized: false,
                    resolveWithFullResponse: true,
                    jar: cookieJar,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                };

                EditRole2Request.form = {
                    csrf_token: csrfTokenHolder,
                    dwfrm_giftRegistry_giftRegistryEvent_coRegistrant_role: coRegistrantRole,
                    dwfrm_giftRegistry_giftRegistryEvent_coRegistrant_firstName: firstNameCoRegistrant,
                    dwfrm_giftRegistry_giftRegistryEvent_coRegistrant_lastName: lastNameCoRegistrant,
                    dwfrm_giftRegistry_giftRegistryEvent_coRegistrant_email: coRegistrantEmail,
                    eventFormType: 'coRegistrant',
                    registryID: registryID
                };
                return request(EditRole2Request);
            })
            .then(function (EditRole2Response) {
                assert.equal(EditRole2Response.statusCode, 200);
                return request(getListJsonRequest);
            })
            .then(function (EditRole2ResponseAsserts) {
                assert.equal(EditRole2ResponseAsserts.statusCode, 200);
                response = JSON.parse(EditRole2ResponseAsserts.body);
                assert.equal(response.success, true);
                assert.equal(response.list.coRegistrant.firstName, firstNameCoRegistrant);
                assert.equal(response.list.coRegistrant.lastName, lastNameCoRegistrant);
                assert.equal(response.list.coRegistrant.role, coRegistrantRole);
                assert.equal(response.list.coRegistrant.email, coRegistrantEmail);
            });
    });

    it('should edit the co-registrant information', function () {
        return request(generateCsrfToken)
            .then(function (EditRole1ResponseCsrf) {
                csrfTokenHolder = JSON.parse(EditRole1ResponseCsrf.body).csrf.token;
                var editRole1Request = {
                    url: config.baseUrl + '/GiftRegistry-Edit',
                    method: 'POST',
                    rejectUnauthorized: false,
                    resolveWithFullResponse: true,
                    jar: cookieJar,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                };

                editRole1Request.form = {
                    csrf_token: csrfTokenHolder,
                    dwfrm_giftRegistry_giftRegistryEvent_registrant_role: coRegistrantRoleEdited,
                    dwfrm_giftRegistry_giftRegistryEvent_registrant_firstName: firstNameCoRegistrantEdited,
                    dwfrm_giftRegistry_giftRegistryEvent_registrant_lastName: lastNameCoRegistrantEdited,
                    dwfrm_giftRegistry_giftRegistryEvent_registrant_email: coRegistrantEmailEdited,
                    eventFormType: 'registrant',
                    registryID: registryID
                };
                return request(editRole1Request);
            })
            .then(function (EditRole1Response) {
                assert.equal(EditRole1Response.statusCode, 200);
                return request(getListJsonRequest);
            })
            .then(function (EditRole1ResponseAsserts) {
                assert.equal(EditRole1ResponseAsserts.statusCode, 200);
                response = JSON.parse(EditRole1ResponseAsserts.body);
                assert.equal(response.success, true);
                assert.equal(response.list.registrant.firstName, firstNameCoRegistrantEdited);
                assert.equal(response.list.registrant.lastName, lastNameCoRegistrantEdited);
                assert.equal(response.list.registrant.role, coRegistrantRoleEdited);
                assert.equal(response.list.registrant.email, coRegistrantEmailEdited);
            });
    });

    it('should add the post event address information', function () {
        return request(generateCsrfToken)
            .then(function (addPostEventResponseCsrf) {
                csrfTokenHolder = JSON.parse(addPostEventResponseCsrf.body).csrf.token;
                var addPostAddressRequest = {
                    url: config.baseUrl + '/GiftRegistry-Edit',
                    method: 'POST',
                    rejectUnauthorized: false,
                    resolveWithFullResponse: true,
                    jar: cookieJar,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                };

                addPostAddressRequest.form = {
                    csrf_token: csrfTokenHolder,
                    post_grAddressSelector: 'new',
                    dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_addressId: addressID2,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_firstName: postAddressFirstName,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_lastName: postAddressLastName,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_address1: postAddress1,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_address2: postAddress2,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_states_stateCode: postAddressState,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_city: postAddressCity,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_postalCode: postAddressZip,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_phone: postAddressPhone,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_country: eventCountryCode,
                    address_saved: 'new',
                    eventFormType: 'postEvent',
                    registryID: registryID,
                    addressID: 'new',
                    addressUUID: ''
                };
                return request(addPostAddressRequest);
            })
            .then(function (addPostAddressResponse) {
                assert.equal(addPostAddressResponse.statusCode, 200);
                return request(getListJsonRequest);
            })
            .then(function (addPostAddressResponseAsserts) {
                assert.equal(addPostAddressResponseAsserts.statusCode, 200);
                response = JSON.parse(addPostAddressResponseAsserts.body);
                assert.equal(response.success, true);
                assert.equal(response.list.postEventShippingAddress.name, addressID2);
                assert.equal(response.list.postEventShippingAddress.firstName, postAddressFirstName);
                assert.equal(response.list.postEventShippingAddress.lastName, postAddressLastName);
                assert.equal(response.list.postEventShippingAddress.address1, postAddress1);
                assert.equal(response.list.postEventShippingAddress.address2, postAddress2);
                assert.equal(response.list.postEventShippingAddress.city, postAddressCity);
                assert.equal(response.list.postEventShippingAddress.postalCode, postAddressZip);
                assert.equal(response.list.postEventShippingAddress.stateCode, postAddressState);
                assert.equal(response.list.postEventShippingAddress.phone, postAddressPhone);
                assert.equal(response.list.postEventShippingAddress.country.value, eventCountryCode);
            });
    });

    it('should set the post event address information to pre event address', function () {
        return request(generateCsrfToken)
            .then(function (editpostEventResponseCsrf) {
                csrfTokenHolder = JSON.parse(editpostEventResponseCsrf.body).csrf.token;
                var editPostEventRequest = {
                    url: config.baseUrl + '/GiftRegistry-Edit',
                    method: 'POST',
                    rejectUnauthorized: false,
                    resolveWithFullResponse: true,
                    jar: cookieJar,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                };
                editPostEventRequest.form = {
                    csrf_token: csrfTokenHolder,
                    post_grAddressSelector: addressID1,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_addressId: addressID1,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_firstName: preAddressFirstName,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_lastName: preAddressLastName,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_address1: preAddress1,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_address2: preAddress2,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_country: eventCountryCode,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_city: preAddressCity,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_states_stateCode: preAddressState,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_postalCode: preAddressZip,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_phone: preAddressPhone,
                    address_saved: 'saved',
                    eventFormType: 'postEvent',
                    registryID: registryID,
                    addressID: addressID1,
                    addressUUID: address1UUID
                };
                return request(editPostEventRequest);
            })
            .then(function (editPostEventResponse) {
                assert.equal(editPostEventResponse.statusCode, 200);
                return request(getListJsonRequest);
            })
            .then(function (editPostEventResponseAsserts) {
                assert.equal(editPostEventResponseAsserts.statusCode, 200);
                response = JSON.parse(editPostEventResponseAsserts.body);
                assert.equal(response.success, true);
                assert.equal(response.list.preEventShippingAddress.name, addressID1);
                assert.equal(response.list.preEventShippingAddress.firstName, preAddressFirstName);
                assert.equal(response.list.preEventShippingAddress.lastName, preAddressLastName);
                assert.equal(response.list.preEventShippingAddress.address1, preAddress1);
                assert.equal(response.list.preEventShippingAddress.address2, preAddress2);
                assert.equal(response.list.preEventShippingAddress.city, preAddressCity);
                assert.equal(response.list.preEventShippingAddress.postalCode, preAddressZip);
                assert.equal(response.list.preEventShippingAddress.phone, preAddressPhone);
                assert.equal(response.list.preEventShippingAddress.country.value, eventCountryCode);
                assert.equal(response.list.preEventShippingAddress.stateCode, preAddressState);

                assert.equal(response.list.postEventShippingAddress.name, addressID1);
                assert.equal(response.list.postEventShippingAddress.firstName, preAddressFirstName);
                assert.equal(response.list.postEventShippingAddress.lastName, preAddressLastName);
                assert.equal(response.list.postEventShippingAddress.address1, preAddress1);
                assert.equal(response.list.postEventShippingAddress.address2, preAddress2);
                assert.equal(response.list.postEventShippingAddress.city, preAddressCity);
                assert.equal(response.list.postEventShippingAddress.postalCode, preAddressZip);
                assert.equal(response.list.postEventShippingAddress.phone, preAddressPhone);
                assert.equal(response.list.postEventShippingAddress.country.value, eventCountryCode);
                assert.equal(response.list.postEventShippingAddress.stateCode, preAddressState);
            });
    });

    it('should edit the pre and post event address information', function () {
        return request(generateCsrfToken)
            .then(function (editpreEventResponseCsrf) {
                csrfTokenHolder = JSON.parse(editpreEventResponseCsrf.body).csrf.token;
                var editPreEventRequest = {
                    url: config.baseUrl + '/GiftRegistry-Edit',
                    method: 'POST',
                    rejectUnauthorized: false,
                    resolveWithFullResponse: true,
                    jar: cookieJar,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                };
                editPreEventRequest.form = {
                    csrf_token: csrfTokenHolder,
                    grAddressSelector: addressID1,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_addressId: addressID1Edited,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_firstName: preAddressFirstNameEdited,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_lastName: preAddressLastNameEdited,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_address1: preAddress1Edited,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_address2: preAddress2Edited,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_country: eventCountryCode,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_states_stateCode: preAddressStateEdited,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_city: preAddressCityEdited,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_postalCode: preAddressZipEdited,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_phone: preAddressPhoneEdited,
                    address_saved: 'new',
                    eventFormType: 'preEvent',
                    registryID: registryID,
                    addressID: addressID1,
                    addressUUID: address1UUID
                };
                return request(editPreEventRequest);
            })
            .then(function (editPreEventResponse) {
                assert.equal(editPreEventResponse.statusCode, 200);
                return request(getListJsonRequest);
            })
            .then(function (editPreEventResponseAsserts) {
                assert.equal(editPreEventResponseAsserts.statusCode, 200);
                response = JSON.parse(editPreEventResponseAsserts.body);
                assert.equal(response.success, true);
                assert.equal(response.list.preEventShippingAddress.name, addressID1Edited);
                assert.equal(response.list.preEventShippingAddress.firstName, preAddressFirstNameEdited);
                assert.equal(response.list.preEventShippingAddress.lastName, preAddressLastNameEdited);
                assert.equal(response.list.preEventShippingAddress.address1, preAddress1Edited);
                assert.equal(response.list.preEventShippingAddress.address2, preAddress2Edited);
                assert.equal(response.list.preEventShippingAddress.city, preAddressCityEdited);
                assert.equal(response.list.preEventShippingAddress.postalCode, preAddressZipEdited);
                assert.equal(response.list.preEventShippingAddress.phone, preAddressPhoneEdited);
                assert.equal(response.list.preEventShippingAddress.country.value, eventCountryCode);
                assert.equal(response.list.preEventShippingAddress.stateCode, preAddressStateEdited);

                assert.equal(response.list.postEventShippingAddress.name, addressID1Edited);
                assert.equal(response.list.postEventShippingAddress.firstName, preAddressFirstNameEdited);
                assert.equal(response.list.postEventShippingAddress.lastName, preAddressLastNameEdited);
                assert.equal(response.list.postEventShippingAddress.address1, preAddress1Edited);
                assert.equal(response.list.postEventShippingAddress.address2, preAddress2Edited);
                assert.equal(response.list.postEventShippingAddress.city, preAddressCityEdited);
                assert.equal(response.list.postEventShippingAddress.postalCode, preAddressZipEdited);
                assert.equal(response.list.postEventShippingAddress.phone, preAddressPhoneEdited);
                assert.equal(response.list.postEventShippingAddress.country.value, eventCountryCode);
                assert.equal(response.list.postEventShippingAddress.stateCode, preAddressStateEdited);
            });
    });

    it('should show error messages for event info submission', function () {
        return request(generateCsrfToken)
            .then(function (editRegistryResponseCsrf) {
                csrfTokenHolder = JSON.parse(editRegistryResponseCsrf.body).csrf.token;
                var editRegistryRequest = {
                    url: config.baseUrl + '/GiftRegistry-Edit',
                    method: 'POST',
                    rejectUnauthorized: false,
                    resolveWithFullResponse: true,
                    jar: cookieJar,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                };

                editRegistryRequest.form = {
                    csrf_token: csrfTokenHolder,
                    dwfrm_giftRegistry_giftRegistryEvent_event_eventName: null,
                    dwfrm_giftRegistry_giftRegistryEvent_event_eventDate: null,
                    dwfrm_giftRegistry_giftRegistryEvent_event_eventCountry: eventCountryCodeEdited,
                    dwfrm_giftRegistry_giftRegistryEvent_event_eventState_stateCode: null,
                    dwfrm_giftRegistry_giftRegistryEvent_event_eventCity: null,
                    eventFormType: 'event',
                    registryID: registryID
                };
                return request(editRegistryRequest);
            })
            .then(function (editRegistryResponse) {
                assert.equal(editRegistryResponse.statusCode, 200);
                response = JSON.parse(editRegistryResponse.body);
                assert.equal(response.success, false);
                assert.equal(response.fields.dwfrm_giftRegistry_giftRegistryEvent_event_eventName, 'Please enter an Event Name');
                assert.equal(response.fields.dwfrm_giftRegistry_giftRegistryEvent_event_eventDate, 'Please enter an Event Date');
                assert.equal(response.fields.dwfrm_giftRegistry_giftRegistryEvent_event_eventState_stateCode, 'Please select a State');
                assert.equal(response.fields.dwfrm_giftRegistry_giftRegistryEvent_event_eventCity, 'Please enter an Event City');
            });
    });
    it('should show error messages for registrant info submission', function () {
        return request(generateCsrfToken)
            .then(function (EditRole2ResponseCsrf) {
                csrfTokenHolder = JSON.parse(EditRole2ResponseCsrf.body).csrf.token;
                var EditRole2Request = {
                    url: config.baseUrl + '/GiftRegistry-Edit',
                    method: 'POST',
                    rejectUnauthorized: false,
                    resolveWithFullResponse: true,
                    jar: cookieJar,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                };

                EditRole2Request.form = {
                    csrf_token: csrfTokenHolder,
                    dwfrm_giftRegistry_giftRegistryEvent_registrant_role: null,
                    dwfrm_giftRegistry_giftRegistryEvent_registrant_firstName: null,
                    dwfrm_giftRegistry_giftRegistryEvent_registrant_lastName: null,
                    dwfrm_giftRegistry_giftRegistryEvent_registrant_email: null,
                    eventFormType: 'registrant',
                    registryID: registryID
                };
                return request(EditRole2Request);
            })
            .then(function (EditRole2Response) {
                assert.equal(EditRole2Response.statusCode, 200);
                response = JSON.parse(EditRole2Response.body);
                assert.equal(response.success, false);
                assert.equal(response.fields.dwfrm_giftRegistry_giftRegistryEvent_registrant_role, 'This field is required.');
                assert.equal(response.fields.dwfrm_giftRegistry_giftRegistryEvent_registrant_firstName, 'This field is required.');
                assert.equal(response.fields.dwfrm_giftRegistry_giftRegistryEvent_registrant_lastName, 'This field is required.');
                assert.equal(response.fields.dwfrm_giftRegistry_giftRegistryEvent_registrant_email, 'This field is required.');
            });
    });

    it('should show error messages for co-registrant info submission', function () {
        return request(generateCsrfToken)
            .then(function (EditRole2ResponseCsrf) {
                csrfTokenHolder = JSON.parse(EditRole2ResponseCsrf.body).csrf.token;
                var EditRole2Request = {
                    url: config.baseUrl + '/GiftRegistry-Edit',
                    method: 'POST',
                    rejectUnauthorized: false,
                    resolveWithFullResponse: true,
                    jar: cookieJar,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                };

                EditRole2Request.form = {
                    csrf_token: csrfTokenHolder,
                    dwfrm_giftRegistry_giftRegistryEvent_coRegistrant_role: null,
                    dwfrm_giftRegistry_giftRegistryEvent_coRegistrant_firstName: null,
                    dwfrm_giftRegistry_giftRegistryEvent_coRegistrant_lastName: null,
                    dwfrm_giftRegistry_giftRegistryEvent_coRegistrant_email: null,
                    eventFormType: 'coRegistrant',
                    registryID: registryID
                };
                return request(EditRole2Request);
            })
            .then(function (EditRole2Response) {
                assert.equal(EditRole2Response.statusCode, 200);
                response = JSON.parse(EditRole2Response.body);
                assert.equal(response.success, false);
                assert.equal(response.fields.dwfrm_giftRegistry_giftRegistryEvent_coRegistrant_role, 'This field is required.');
                assert.equal(response.fields.dwfrm_giftRegistry_giftRegistryEvent_coRegistrant_firstName, 'This field is required.');
                assert.equal(response.fields.dwfrm_giftRegistry_giftRegistryEvent_coRegistrant_lastName, 'This field is required.');
                assert.equal(response.fields.dwfrm_giftRegistry_giftRegistryEvent_coRegistrant_email, 'This field is required.');
            });
    });

    it('should show error messages for pre-event info submission', function () {
        return request(generateCsrfToken)
            .then(function (editpreEventResponseCsrf) {
                csrfTokenHolder = JSON.parse(editpreEventResponseCsrf.body).csrf.token;
                var editPreEventRequest = {
                    url: config.baseUrl + '/GiftRegistry-Edit',
                    method: 'POST',
                    rejectUnauthorized: false,
                    resolveWithFullResponse: true,
                    jar: cookieJar,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                };
                editPreEventRequest.form = {
                    csrf_token: csrfTokenHolder,
                    grAddressSelector: addressID1,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_addressId: null,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_firstName: null,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_lastName: null,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_address1: null,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_address2: null,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_country: eventCountryCode,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_states_stateCode: null,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_city: null,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_postalCode: null,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_phone: null,
                    address_saved: 'new',
                    eventFormType: 'preEvent',
                    registryID: registryID,
                    addressID: addressID1,
                    addressUUID: address1UUID
                };
                return request(editPreEventRequest);
            })
            .then(function (editPreEventResponse) {
                assert.equal(editPreEventResponse.statusCode, 200);
                response = JSON.parse(editPreEventResponse.body);
                assert.equal(response.success, false);
                assert.equal(response.fields.dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_addressId, 'This field is required.');
                assert.equal(response.fields.dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_firstName, 'Please enter a First name');
                assert.equal(response.fields.dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_lastName, 'Please enter a Last name');
                assert.equal(response.fields.dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_address1, 'Please enter Address information');
                assert.equal(response.fields.dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_city, 'Please enter a City');
                assert.equal(response.fields.dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_postalCode, 'Please enter a ZIP Code');
                assert.equal(response.fields.dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_states_stateCode, 'Please select a State');
                assert.equal(response.fields.dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_phone, 'Please enter a Telephone Number');
            });
    });

    it('should show error messages for post-event info submission', function () {
        return request(generateCsrfToken)
            .then(function (editpreEventResponseCsrf) {
                csrfTokenHolder = JSON.parse(editpreEventResponseCsrf.body).csrf.token;
                var editPreEventRequest = {
                    url: config.baseUrl + '/GiftRegistry-Edit',
                    method: 'POST',
                    rejectUnauthorized: false,
                    resolveWithFullResponse: true,
                    jar: cookieJar,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                };
                editPreEventRequest.form = {
                    csrf_token: csrfTokenHolder,
                    grAddressSelector: addressID1,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_addressId: null,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_firstName: null,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_lastName: null,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_address1: null,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_address2: null,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_country: eventCountryCode,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_states_stateCode: null,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_city: null,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_postalCode: null,
                    dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_phone: null,
                    address_saved: 'new',
                    eventFormType: 'postEvent',
                    registryID: registryID,
                    addressID: addressID1,
                    addressUUID: address1UUID
                };
                return request(editPreEventRequest);
            })
            .then(function (editPreEventResponse) {
                assert.equal(editPreEventResponse.statusCode, 200);
                response = JSON.parse(editPreEventResponse.body);
                assert.equal(response.success, false);
                assert.equal(response.fields.dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_addressId, 'This field is required.');
                assert.equal(response.fields.dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_firstName, 'Please enter a First name');
                assert.equal(response.fields.dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_lastName, 'Please enter a Last name');
                assert.equal(response.fields.dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_address1, 'Please enter Address information');
                assert.equal(response.fields.dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_city, 'Please enter a City');
                assert.equal(response.fields.dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_postalCode, 'Please enter a ZIP Code');
                assert.equal(response.fields.dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_states_stateCode, 'Please select a State');
                assert.equal(response.fields.dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_phone, 'Please enter a Telephone Number');
            });
    });
});
