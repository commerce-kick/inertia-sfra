'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('emailHelper: Validate Email', function () {
    var emailHelpers = proxyquire('../../../../../cartridges/app_storefront_base/cartridge/scripts/helpers/emailHelpers', {
    });

    it('should return true for valid email', function () {
        var result = emailHelpers.validateEmail('JaneSmith@abc.com');
        assert.isTrue(result);
    });

    it('should return false for email without @', function () {
        var result = emailHelpers.validateEmail('JaneSmith');
        assert.isFalse(result);
    });

    it('should return false for email without .', function () {
        var result = emailHelpers.validateEmail('JaneSmith@abc');
        assert.isFalse(result);
    });

    it('should return true for email with long domain', function () {
        // Ref: https://en.wikipedia.org/wiki/List_of_Internet_top-level_domains#I
        var result = emailHelpers.validateEmail('JaneSmith@abc.international');
        assert.isTrue(result);
    });
});
