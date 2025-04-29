'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('my account giftRegistryList decorator', function () {
    var grListDecorator = proxyquire('../../../../../../cartridges/plugin_giftregistry/cartridge/models/account/decorators/giftRegistryList', {
        '*/cartridge/models/giftRegistry': function (item) {
            return item;
        }
    });

    it('should create a property on the passed in object called giftRegistryList with 2 entries, sort ascending', function () {
        var object = {};
        var apiGiftRegistryListMock = {
            toArray: function () {
                return [
                    { eventDate: new Date(2019, 3, 9) }, // Apr 9 2019
                    { eventDate: new Date(2018, 7, 20) }, // Aug 20 2018
                    { eventDate: new Date(2018, 7, 20) }, // Aug 20 2018
                    { eventDate: new Date(2018, 7, 16) } // Aug 16 2018
                ];
            },
            length: 4
        };

        grListDecorator(object, apiGiftRegistryListMock, 2, 1);
        assert.property(object, 'giftRegistryList');
        assert.equal(object.giftRegistryList.length, 2);

        // Aug 16, 2018
        assert.equal(object.giftRegistryList[0].eventDate.getDate(), '16');
        assert.equal(object.giftRegistryList[0].eventDate.getMonth(), '7');
        assert.equal(object.giftRegistryList[0].eventDate.getFullYear(), '2018');

        // Aug 20, 2018
        assert.equal(object.giftRegistryList[1].eventDate.getDate(), '20');
        assert.equal(object.giftRegistryList[1].eventDate.getMonth(), '7');
        assert.equal(object.giftRegistryList[1].eventDate.getFullYear(), '2018');
    });

    it('should create a property on the passed in object called giftRegistryList with 4 entries, sort ascending', function () {
        var object = {};
        var apiGiftRegistryListMock = {
            toArray: function () {
                return [
                    { eventDate: new Date(2019, 3, 9) }, // Mar 9 2019
                    { eventDate: new Date(2018, 7, 20) }, // July 20 2018
                    { eventDate: new Date(2018, 7, 20) }, // July 20 2018
                    { eventDate: new Date(2018, 7, 16) } // July 16 2018
                ];
            }
        };

        grListDecorator(object, apiGiftRegistryListMock);
        assert.property(object, 'giftRegistryList');
        assert.equal(object.giftRegistryList.length, 4);

        // July 16, 2018
        assert.equal(object.giftRegistryList[0].eventDate.getDate(), '16');
        assert.equal(object.giftRegistryList[0].eventDate.getMonth(), '7');
        assert.equal(object.giftRegistryList[0].eventDate.getFullYear(), '2018');

        // July 20, 2018
        assert.equal(object.giftRegistryList[1].eventDate.getDate(), '20');
        assert.equal(object.giftRegistryList[1].eventDate.getMonth(), '7');
        assert.equal(object.giftRegistryList[1].eventDate.getFullYear(), '2018');

        // July 20, 2018
        assert.equal(object.giftRegistryList[2].eventDate.getDate(), '20');
        assert.equal(object.giftRegistryList[2].eventDate.getMonth(), '7');
        assert.equal(object.giftRegistryList[2].eventDate.getFullYear(), '2018');

        // March 9, 2019
        assert.equal(object.giftRegistryList[3].eventDate.getDate(), '9');
        assert.equal(object.giftRegistryList[3].eventDate.getMonth(), '3');
        assert.equal(object.giftRegistryList[3].eventDate.getFullYear(), '2019');
    });

    it('should create a property on the passed in object called giftRegistryList with 1 entry if giftRegistryList only has 1 item', function () {
        var object = {};
        var apiGiftRegistryListMock = {
            toArray: function () {
                return [
                    { eventDate: new Date(2018, 7, 20) } // Aug 20 2018
                ];
            }
        };

        grListDecorator(object, apiGiftRegistryListMock);
        assert.equal(object.giftRegistryList.length, 1);

        // Aug 20, 2018
        assert.equal(object.giftRegistryList[0].eventDate.getDate(), '20');
        assert.equal(object.giftRegistryList[0].eventDate.getMonth(), '7');
        assert.equal(object.giftRegistryList[0].eventDate.getFullYear(), '2018');
    });
});
