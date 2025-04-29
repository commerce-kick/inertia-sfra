'use strict';

var Resource = require('dw/web/Resource');
var CustomerMgr = require('dw/customer/CustomerMgr');
var URLUtils = require('dw/web/URLUtils');
var productListMgr = require('dw/customer/ProductListMgr');

/**
 * creates a results object for a gift registry search
 * @param {string} firstName - firstName of the search form
 * @param {string} lastName - lastName of the search form
 * @param {Object} config - config object
 * @returns {Object} an object that contains information about the users address
 */
function createSearchResultObject(firstName, lastName, config) {
    if (!firstName && !lastName) {
        return null;
    }

    var profiles = [];
    var response = {
        hits: [],
        firstName: firstName,
        lastName: lastName,
        total: 0
    };

    if (config.email) {
        var listOwner = CustomerMgr.getCustomerByLogin(config.email);
        if (listOwner) {
            profiles.push(listOwner.profile);
        }
    } else if (firstName && lastName) {
        profiles = CustomerMgr.queryProfiles('firstName = {0} AND lastName = {1}', null, firstName, lastName).asList().toArray();
    }

    var result;
    var addToHits = false;
    var allHits = [];
    profiles.forEach(function (profile) {
        var grLists = productListMgr.getProductLists(profile.customer, 11).toArray();
        grLists.forEach(function (registry) {
            addToHits = false;
            result = {
                name: registry.name,
                city: registry.eventCity,
                uuid: registry.UUID,
                url: URLUtils.https('GiftRegistry-ShowOthers', 'id', registry.UUID).relative().toString(),
                registrant: {
                    name: Resource.msgf('name.html.value.txt', 'giftRegistry', null, registry.registrant.firstName, registry.registrant.lastName),
                    firstName: registry.registrant.firstName,
                    lastName: registry.registrant.lastName
                }
            };

            if (registry.coRegistrant) {
                result.coRegistrant = {
                    name: Resource.msgf('name.html.value.txt', 'giftRegistry', null, registry.coRegistrant.firstName, registry.coRegistrant.lastName),
                    firstName: registry.coRegistrant.firstName,
                    lastName: registry.coRegistrant.lastName
                };
            } else {
                result.coRegistrant = null;
            }

            if (!registry.eventState) {
                result.location = registry.eventCity;
            } else {
                result.location = Resource.msgf('gr.search.result.location.text', 'giftRegistry', null, registry.eventCity, registry.eventState);
            }

            var date = registry.eventDate;
            result.dateString = Resource.msgf('gr.search.result.date.text', 'giftRegistry', null, date.getDate(), date.getMonth() + 1, date.getYear().toString());

            var isPublic = false;
            var matchingMonth = false;
            var matchingYear = false;
            var matchingName = false;
            var matchingState = false;
            var matchingCity = false;
            var matchingCountry = false;

            if (registry.public) { isPublic = true; }

            if (config.year) {
                if (parseInt(config.year, 10) === date.getFullYear()) { matchingYear = true; }
            } else { matchingYear = true; }

            if (config.month) {
                if (parseInt(config.month, 10) === date.getMonth() + 1) { matchingMonth = true; }
            } else { matchingMonth = true; }

            if (config.name) {
                if (config.name === registry.name) { matchingName = true; }
            } else { matchingName = true; }

            if (config.state) {
                if (config.state === registry.eventState) { matchingState = true; }
            } else { matchingState = true; }

            if (config.city) {
                if (config.city === registry.eventCity) { matchingCity = true; }
            } else { matchingCity = true; }

            if (config.country) {
                if (config.country === registry.eventCountry) { matchingCountry = true; }
            } else { matchingCountry = true; }

            addToHits = isPublic && matchingMonth && matchingYear && matchingName && matchingState && matchingCity && matchingCountry;

            if (addToHits) {
                response.total++;
                allHits.push(result);
            }
        });
    });

    if (allHits.length > 0) {
        var startingIndex = (config.pageSize * config.pageNumber) - config.pageSize;
        var endIndex = (config.pageSize * config.pageNumber);
        endIndex = endIndex < response.total ? endIndex : response.total;
        response.hits = allHits.slice(startingIndex, endIndex);
    }
    return response;
}

/**
 * creates a results object for a gift registry search
 * @param {string} firstName - firstName of the search form
 * @param {string} lastName - lastName of the search form
 * @param {Object} config - config object
 * @constructor
 */
function search(firstName, lastName, config) {
    return createSearchResultObject(firstName, lastName, config);
}

module.exports = search;
