"use strict";

var Resource = require("dw/web/Resource");
var CustomerMgr = require("dw/customer/CustomerMgr");
var URLUtils = require("dw/web/URLUtils");
var productListMgr = require("dw/customer/ProductListMgr");

/**
 * creates a results object for a wishlists search
 * @param {string} firstName - firstName of the search form
 * @param {string} lastName - lastName of the search form
 * @param {string} email - email of the search form
 * @param {Object} config - config object
 * @returns {Object} an object that contains information about the users address
 */
function createSearchResultObject(firstName, lastName, email, config) {
    var PAGE_SIZE = 8;
    var pageSize = config.pageSize || PAGE_SIZE;
    var uuids =
        config.uuids.toString().length === 0 ? [] : JSON.parse(config.uuids);

    if (!firstName && !lastName && !email) {
        return null;
    }

    var profiles = [];
    var response = {
        hits: [],
        firstName: firstName,
        lastName: lastName
    };

    if (email) {
        var listOwner = CustomerMgr.getCustomerByLogin(email);
        if (listOwner) {
            profiles.push(listOwner.profile);
        }
    } else if (firstName && lastName) {
        profiles = CustomerMgr.queryProfiles(
            "firstName = {0} AND lastName = {1}",
            null,
            firstName,
            lastName
        )
            .asList()
            .toArray();
    } else if (firstName && !lastName) {
        profiles = CustomerMgr.queryProfiles("firstName = {0}", null, firstName)
            .asList()
            .toArray();
    } else if (!firstName && lastName) {
        profiles = CustomerMgr.queryProfiles("lastName = {0}", null, lastName)
            .asList()
            .toArray();
    }

    var lists;
    var totalNumber = 0;
    var pageNumber = config.pageNumber || 1;
    var uuid;
    var changedList = false;
    var uuidsCount = 0;
    profiles.forEach(function (profile) {
        lists = productListMgr.getProductLists(profile.customer, 10);
        if (lists.length > 0 && lists[0].public) {
            if (totalNumber < pageSize * pageNumber) {
                if (uuids.length > totalNumber) {
                    uuid = uuids[totalNumber];
                    uuidsCount++;
                }
                if (
                    uuidsCount < pageSize * (pageNumber - 1) &&
                    uuids.length > 0 &&
                    uuid !== lists[0].ID
                ) {
                    changedList = true;
                }

                totalNumber++;
                response.hits.push({
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    id: lists[0].ID,
                    url: URLUtils.url(
                        "Wishlist-ShowOthers",
                        "id",
                        lists[0].ID
                    ).toString(),
                    urlTitle: Resource.msg(
                        "title.link.view.public.list",
                        "productlist",
                        null
                    ),
                    urlText: Resource.msg(
                        "txt.link.view.public.list",
                        "productlist",
                        null
                    )
                });
            } else {
                totalNumber++;
            }
        }
    });

    if (!changedList) {
        var end = response.hits.length;
        var hitsDelta = response.hits.slice((pageNumber - 1) * pageSize, end);
        response.totalNumber = hitsDelta.length;
        response.hits = hitsDelta;
    }
    response.pageNumber = pageNumber;
    response.pageSize = pageSize;
    response.total = totalNumber;
    response.totalString = Resource.msgf(
        "txt.heading.wl.search.results.count",
        "wishlist",
        null,
        totalNumber
    );
    response.showMore = !(totalNumber <= pageSize * pageNumber);
    response.changedList = changedList;
    return response;
}

/**
 * creates a results object for a wishlists search
 * @param {string} firstName - firstName of the search form
 * @param {string} lastName - lastName of the search form
 * @param {string} email - email of the search form
 * @param {Object} config - config object
 * @constructor
 */
function search(firstName, lastName, email, config) {
    return createSearchResultObject(firstName, lastName, email, config);
}

module.exports = search;
