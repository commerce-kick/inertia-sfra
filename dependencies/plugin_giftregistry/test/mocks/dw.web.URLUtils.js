'use strict';

module.exports = {
    url: function () {
        return {
            relative: function () {
                return {
                    toString: function () {
                        return 'someUrl';
                    }
                };
            }
        };
    }
};
