'use strict';

/**
 * DevTools enablement gate (Laravel's Inertia\DevTools\DevTools::enabled()).
 *
 * The recorder runs only while the Vite dev server is active — signalled by the
 * hot.json file the vite-hot-file-plugin writes into the storefront cartridge —
 * and never on a production instance, even if hot.json is deployed by accident.
 */

/**
 * @returns {Boolean} whether request recording and the entries endpoint are on
 */
function enabled() {
    try {
        require('*/cartridge/scripts/hot.json');
    } catch (e) {
        return false;
    }

    try {
        var System = require('dw/system/System');
        return System.getInstanceType() !== System.PRODUCTION_SYSTEM;
    } catch (e) {
        return false;
    }
}

module.exports = {
    enabled: enabled
};
