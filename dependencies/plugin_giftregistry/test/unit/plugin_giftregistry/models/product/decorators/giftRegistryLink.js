'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('giftRegistryLink decorator', function () {
    var giftRegistryLinkDecorator = proxyquire('../../../../../../cartridges/plugin_giftregistry/cartridge/models/product/decorators/giftRegistryLink', {
        'dw/web/URLUtils': {
            url: function () {
                return {
                    relative: function () {
                        return {
                            toString: function () {
                                return 'string url';
                            }
                        };
                    }
                };
            }
        }
    });

    it('should create a property on the passed in object called giftRegistryLink', function () {
        var object = { pid: '12345', qty: 1 };
        giftRegistryLinkDecorator(object, {}, {}, 1);

        assert.equal(object.giftRegistryLink, 'string url');
    });
});
