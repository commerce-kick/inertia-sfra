'use strict';

var BaseData = require('../BaseData');

var BonusProductLineItemData = BaseData.extend({
    schema: {
        id: { type: 'string' },
        name: { type: 'string' }
    }
});

module.exports = BonusProductLineItemData;
