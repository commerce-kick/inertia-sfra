'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var wishlistSearchModel = proxyquire('../../../../../cartridges/plugin_wishlists/cartridge/models/wishlist/search', {
    'dw/web/Resource': {
        msg: function () {
            return 'urlTitle or urlText';
        },
        msgf: function () {
            return 'number of results';
        }
    },
    'dw/customer/CustomerMgr': {
        getCustomerByLogin: function () {
            return {
                profile: {
                    customer: {
                    },
                    firstName: 'firstName',
                    lastName: 'lastName',
                    email: 'email'
                }
            };
        },
        queryProfiles: function () {
            var arr = [{
                customer: {
                    profile: {
                        firstName: 'firstName',
                        lastName: 'lastName',
                        email: 'email'
                    }
                },
                firstName: 'firstName',
                lastName: 'lastName',
                email: 'email',
                id: 'id',
                url: 'url',
                urlTitle: 'urlTitle',
                urlText: 'urlText'
            },
            {
                customer: {
                    firstName: 'firstName',
                    lastName: 'lastName',
                    email: 'email2'
                },
                firstName: 'firstName',
                lastName: 'lastName',
                email: 'email2',
                id: 'id2',
                url: 'url2',
                urlTitle: 'urlTitle2',
                urlText: 'urlText2'
            }];
            arr.asList = function () {
                return {
                    toArray: function () {
                        return arr;
                    }
                };
            };
            return arr;
        }
    },
    'dw/web/URLUtils': {
        url: function () {
            return 'urlToList';
        }
    },
    'dw/customer/ProductListMgr': {
        getProductLists: function () {
            return [{
                public: true,
                ID: 'idString',
                firstName: 'firstName',
                lastName: 'lastName',
                email: 'email'
            }];
        }
    }
});

describe('Wishlist search', function () {
    it('should return null if there is no search terms entered', function () {
        var firstName = null;
        var lastName = null;
        var email = null;
        var config = {
            uuids: '[]'
        };

        var results = wishlistSearchModel(firstName, lastName, email, config);

        assert.equal(results, null);
    });

    it('should return 1 entry if the email is part of the search terms', function () {
        var firstName = null;
        var lastName = null;
        var email = 'someone@somewhere.com';
        var config = {
            uuids: []
        };
        var expectedResults = {
            'hits': [{
                'url': 'urlToList',
                'urlTitle': 'urlTitle or urlText',
                'urlText': 'urlTitle or urlText',
                'firstName': 'firstName',
                'lastName': 'lastName'

            }],
            'totalNumber': 1,
            'pageNumber': 1,
            'pageSize': 8,
            'total': 1,
            'totalString': 'number of results',
            'showMore': false,
            'firstName': null,
            'lastName': null,
            'changedList': false
        };

        var results = wishlistSearchModel(firstName, lastName, email, config);

        assert.equal(results.hits.length, expectedResults.hits.length);
        assert.equal(results.hits[0].url, expectedResults.hits[0].url);
        assert.equal(results.hits[0].firstName, expectedResults.hits[0].firstName);
        assert.equal(results.hits[0].lastName, expectedResults.hits[0].lastName);
        assert.equal(results.hits[0].email, expectedResults.hits[0].email);
        assert.equal(results.hits[0].urlTitle, expectedResults.hits[0].urlTitle);
        assert.equal(results.hits[0].urlText, expectedResults.hits[0].urlText);
        assert.equal(results.totalNumber, expectedResults.totalNumber);
        assert.equal(results.pageNumber, expectedResults.pageNumber);
        assert.equal(results.total, expectedResults.total);
        assert.equal(results.totalString, expectedResults.totalString);
        assert.equal(results.showMore, expectedResults.showMore);
        assert.equal(results.firstName, expectedResults.firstName);
        assert.equal(results.lastName, expectedResults.lastName);
        assert.equal(results.changedList, expectedResults.changedList);
    });

    it('should return results if the first and last name are part of the search terms', function () {
        var firstName = 'firstName';
        var lastName = 'lastName';
        var email = null;
        var config = {
            uuids: []
        };
        var expectedResults = {
            hits: [{
                firstName: 'firstName',
                lastName: 'lastName',
                id: 'idString',
                url: 'urlToList',
                urlTitle: 'urlTitle or urlText',
                urlText: 'urlTitle or urlText'
            },
            {
                firstName: 'firstName',
                lastName: 'lastName',
                id: 'idString',
                url: 'urlToList',
                urlTitle: 'urlTitle or urlText',
                urlText: 'urlTitle or urlText'
            }],
            totalNumber: 2,
            pageNumber: 1,
            pageSize: 8,
            total: 2,
            totalString: 'number of results',
            showMore: false,
            firstName: 'firstName',
            lastName: 'lastName',
            changedList: false
        };
        var results = wishlistSearchModel(firstName, lastName, email, config);
        assert.equal(results.hits.length, expectedResults.hits.length);
        assert.equal(results.hits[0].url, expectedResults.hits[0].url);
        assert.equal(results.hits[0].firstName, expectedResults.hits[0].firstName);
        assert.equal(results.hits[0].lastName, expectedResults.hits[0].lastName);
        assert.equal(results.hits[0].email, expectedResults.hits[0].email);
        assert.equal(results.hits[0].urlTitle, expectedResults.hits[0].urlTitle);
        assert.equal(results.hits[0].urlText, expectedResults.hits[0].urlText);
        assert.equal(results.hits[1].url, expectedResults.hits[1].url);
        assert.equal(results.hits[1].firstName, expectedResults.hits[1].firstName);
        assert.equal(results.hits[1].lastName, expectedResults.hits[1].lastName);
        assert.equal(results.hits[1].email, expectedResults.hits[1].email);
        assert.equal(results.hits[1].urlTitle, expectedResults.hits[1].urlTitle);
        assert.equal(results.hits[1].urlText, expectedResults.hits[1].urlText);
        assert.equal(results.totalNumber, expectedResults.totalNumber);
        assert.equal(results.pageNumber, expectedResults.pageNumber);
        assert.equal(results.total, expectedResults.total);
        assert.equal(results.totalString, expectedResults.totalString);
        assert.equal(results.showMore, expectedResults.showMore);
        assert.equal(results.firstName, expectedResults.firstName);
        assert.equal(results.lastName, expectedResults.lastName);
        assert.equal(results.changedList, expectedResults.changedList);
    });

    it('should return results if the last name is part of the search terms', function () {
        var firstName = null;
        var lastName = 'lastName';
        var email = null;
        var config = {
            uuids: []
        };

        var expectedResults = {
            hits: [
                {
                    firstName: 'firstName',
                    lastName: 'lastName',
                    id: 'idString',
                    url: 'urlToList',
                    urlTitle: 'urlTitle or urlText',
                    urlText: 'urlTitle or urlText'
                },
                {
                    firstName: 'firstName',
                    lastName: 'lastName',
                    id: 'idString',
                    url: 'urlToList',
                    urlTitle: 'urlTitle or urlText',
                    urlText: 'urlTitle or urlText'
                }
            ],
            totalNumber: 2,
            pageNumber: 1,
            pageSize: 8,
            total: 2,
            totalString: 'number of results',
            showMore: false,
            firstName: null,
            lastName: 'lastName',
            changedList: false
        };
        var results = wishlistSearchModel(firstName, lastName, email, config);
        assert.equal(results.hits.length, expectedResults.hits.length);
        assert.equal(results.hits[0].url, expectedResults.hits[0].url);
        assert.equal(results.hits[0].firstName, expectedResults.hits[0].firstName);
        assert.equal(results.hits[0].lastName, expectedResults.hits[0].lastName);
        assert.equal(results.hits[0].email, expectedResults.hits[0].email);
        assert.equal(results.hits[0].urlTitle, expectedResults.hits[0].urlTitle);
        assert.equal(results.hits[0].urlText, expectedResults.hits[0].urlText);
        assert.equal(results.hits[1].url, expectedResults.hits[1].url);
        assert.equal(results.hits[1].firstName, expectedResults.hits[1].firstName);
        assert.equal(results.hits[1].lastName, expectedResults.hits[1].lastName);
        assert.equal(results.hits[1].email, expectedResults.hits[1].email);
        assert.equal(results.hits[1].urlTitle, expectedResults.hits[1].urlTitle);
        assert.equal(results.hits[1].urlText, expectedResults.hits[1].urlText);
        assert.equal(results.totalNumber, expectedResults.totalNumber);
        assert.equal(results.pageNumber, expectedResults.pageNumber);
        assert.equal(results.total, expectedResults.total);
        assert.equal(results.totalString, expectedResults.totalString);
        assert.equal(results.showMore, expectedResults.showMore);
        assert.equal(results.firstName, expectedResults.firstName);
        assert.equal(results.lastName, expectedResults.lastName);
        assert.equal(results.changedList, expectedResults.changedList);
    });

    it('should return results if the first is part of the search terms', function () {
        var firstName = 'firstName';
        var lastName = null;
        var email = null;
        var config = {
            uuids: []
        };

        var expectedResults = {
            hits: [
                {
                    firstName: 'firstName',
                    lastName: 'lastName',
                    id: 'idString',
                    url: 'urlToList',
                    urlTitle: 'urlTitle or urlText',
                    urlText: 'urlTitle or urlText'
                },
                {
                    firstName: 'firstName',
                    lastName: 'lastName',
                    id: 'idString',
                    url: 'urlToList',
                    urlTitle: 'urlTitle or urlText',
                    urlText: 'urlTitle or urlText'
                }
            ],
            totalNumber: 2,
            pageNumber: 1,
            pageSize: 8,
            total: 2,
            totalString: 'number of results',
            showMore: false,
            firstName: 'firstName',
            lastName: null,
            changedList: false
        };
        var results = wishlistSearchModel(firstName, lastName, email, config);
        assert.equal(results.hits.length, expectedResults.hits.length);
        assert.equal(results.hits[0].url, expectedResults.hits[0].url);
        assert.equal(results.hits[0].firstName, expectedResults.hits[0].firstName);
        assert.equal(results.hits[0].lastName, expectedResults.hits[0].lastName);
        assert.equal(results.hits[0].email, expectedResults.hits[0].email);
        assert.equal(results.hits[0].urlTitle, expectedResults.hits[0].urlTitle);
        assert.equal(results.hits[0].urlText, expectedResults.hits[0].urlText);
        assert.equal(results.hits[1].url, expectedResults.hits[1].url);
        assert.equal(results.hits[1].firstName, expectedResults.hits[1].firstName);
        assert.equal(results.hits[1].lastName, expectedResults.hits[1].lastName);
        assert.equal(results.hits[1].email, expectedResults.hits[1].email);
        assert.equal(results.hits[1].urlTitle, expectedResults.hits[1].urlTitle);
        assert.equal(results.hits[1].urlText, expectedResults.hits[1].urlText);
        assert.equal(results.totalNumber, expectedResults.totalNumber);
        assert.equal(results.pageNumber, expectedResults.pageNumber);
        assert.equal(results.total, expectedResults.total);
        assert.equal(results.totalString, expectedResults.totalString);
        assert.equal(results.showMore, expectedResults.showMore);
        assert.equal(results.firstName, expectedResults.firstName);
        assert.equal(results.lastName, expectedResults.lastName);
        assert.equal(results.changedList, expectedResults.changedList);
    });

    it('should return an indication the list has changed when the passed in uuids do not match', function () {
        var firstName = 'firstName';
        var lastName = null;
        var email = null;
        var uuids = JSON.stringify(['idString', 'idString2']);
        var config = {
            uuids: uuids,
            pageNumber: 2
        };

        var results = wishlistSearchModel(firstName, lastName, email, config);
        assert.equal(results.changedList, true);
    });

    it('should return the total number of results with the first page', function () {
        var firstName = 'firstName';
        var lastName = null;
        var email = null;
        var uuids = JSON.stringify(['idString']);
        var config = {
            uuids: uuids,
            pageNumber: 1,
            pageSize: 1
        };

        var expectedResults = {
            hits: [
                {
                    firstName: 'firstName',
                    lastName: 'lastName',
                    id: 'idString',
                    url: 'urlToList',
                    urlTitle: 'urlTitle or urlText',
                    urlText: 'urlTitle or urlText'
                },
                {
                    firstName: 'firstName',
                    lastName: 'lastName',
                    id: 'idString',
                    url: 'urlToList',
                    urlTitle: 'urlTitle or urlText',
                    urlText: 'urlTitle or urlText'
                }
            ],
            totalNumber: 2,
            pageNumber: 1,
            pageSize: 8,
            total: 2,
            totalString: 'number of results',
            showMore: false,
            firstName: 'firstName',
            lastName: null,
            changedList: false
        };
        var results = wishlistSearchModel(firstName, lastName, email, config);
        assert.equal(results.hits.length, 1);
        assert.equal(results.hits[0].url, expectedResults.hits[0].url);
        assert.equal(results.hits[0].firstName, expectedResults.hits[0].firstName);
        assert.equal(results.hits[0].lastName, expectedResults.hits[0].lastName);
        assert.equal(results.hits[0].email, expectedResults.hits[0].email);
        assert.equal(results.hits[0].urlTitle, expectedResults.hits[0].urlTitle);
        assert.equal(results.hits[0].urlText, expectedResults.hits[0].urlText);
        assert.equal(results.totalNumber, 1);
        assert.equal(results.total, 2);
        assert.equal(results.totalString, expectedResults.totalString);
        assert.equal(results.showMore, true);
        assert.equal(results.firstName, expectedResults.firstName);
        assert.equal(results.lastName, expectedResults.lastName);
        assert.equal(results.changedList, expectedResults.changedList);
    });
});
