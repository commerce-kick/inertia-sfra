'use strict';

/**
 * Inertia adapter configuration defaults (Laravel's config/inertia.php).
 * Override per-site by shadowing this module in a higher cartridge.
 */
module.exports = {
    // Emit the `sharedProps` page key listing top-level shared prop keys.
    exposeSharedPropKeys: true,

    // Root ISML template for full-page (non-XHR) loads.
    rootView: 'components/layout/inertia'
};
