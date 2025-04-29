'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var GiftRegistryEventModel = proxyquire('../../../../cartridges/plugin_giftregistry/cartridge/models/giftRegistryEvent', {});

var eventForm = {
    eventName: {
        htmlValue: 'event name'
    },
    eventDate: {
        htmlValue: 'event date'
    },
    eventCountry: {
        htmlValue: 'event country'
    },
    eventCity: {
        htmlValue: 'event city'
    },
    eventState: {
        stateCode: {
            htmlValue: 'event state'
        }
    }
};

var registrantForm = {
    role: {
        htmlValue: 'role'
    },
    firstName: {
        htmlValue: 'first name'
    },
    lastName: {
        htmlValue: 'last name'
    },
    email: {
        htmlValue: 'email'
    }
};

var coRegistrantForm = {
    role: {
        htmlValue: 'role'
    },
    firstName: {
        htmlValue: 'first name'
    },
    lastName: {
        htmlValue: 'last name'
    },
    email: {
        htmlValue: 'email'
    }
};

var hasCoRegistrant = true;

var expectedResult = {
    eventForm: {
        eventName: 'event name',
        eventDate: 'event date',
        eventCountry: 'event country',
        eventCity: 'event city',
        eventState: 'event state'
    },
    registrantForm: {
        role: 'role',
        firstName: 'first name',
        lastName: 'last name',
        email: 'email'
    },
    coRegistrantForm: {
        role: 'role',
        firstName: 'first name',
        lastName: 'last name',
        email: 'email'
    }
};

describe('giftRegistryEvent', function () {
    it('returns a model with all 3 forms', function () {
        var result = new GiftRegistryEventModel(eventForm, registrantForm, coRegistrantForm, hasCoRegistrant);
        assert.deepEqual(result, expectedResult);
    });

    it('returns a model with all 3 forms with no state', function () {
        eventForm.eventState = null;
        var result = new GiftRegistryEventModel(eventForm, registrantForm, coRegistrantForm, hasCoRegistrant);
        assert.equal(result.eventForm.eventState, false);
        eventForm.eventState = {
            stateCode: {
                htmlValue: 'event state'
            }
        };
    });

    it('returns a model with no co-registrant', function () {
        var result = new GiftRegistryEventModel(eventForm, registrantForm, coRegistrantForm, false);
        expectedResult.coRegistrantForm = false;
        assert.deepEqual(result, expectedResult);
    });
});
