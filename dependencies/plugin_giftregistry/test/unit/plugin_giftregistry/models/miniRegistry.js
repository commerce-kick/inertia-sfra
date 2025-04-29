'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('miniRegistry model', function () {
    var MiniRegistryModel = proxyquire('../../../../cartridges/plugin_giftregistry/cartridge/models/miniRegistry', {
        'dw/web/URLUtils': {
            url: function () {
                return 'someURL';
            }
        }
    });

    var productListMock = {
        UUID: 'someUUID',
        eventDate: 'someEventDate',
        eventCity: 'someEventCity',
        eventState: 'someEventState',
        name: 'someName'
    };

    var queryStringArgs = 'encodedURIComponent';

    it('should create a miniRegistry model', function () {
        var result = new MiniRegistryModel(productListMock, queryStringArgs);

        assert.equal(result.UUID, 'someUUID');
        assert.equal(result.eventDate, 'someEventDate');
        assert.equal(result.eventCity, 'someEventCity');
        assert.equal(result.eventState, 'someEventState');
        assert.equal(result.eventName, 'someName');
        assert.equal(result.url, 'someURL');
    });
});
