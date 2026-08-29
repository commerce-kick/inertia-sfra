'use strict';

/**
 * Middleware to share global data with Inertia
 */
function shareData(req, res, next) {
    var catalogMgr = require("dw/catalog/CatalogMgr");
    var Categories = require("*/cartridge/models/categories");
    var csrfProtection = require("*/cartridge/scripts/middleware/csrf");

    // Check if Inertia is initialized
    if (!res.inertia) {
        return next();
    }

    var siteRootCategory = catalogMgr.getSiteCatalog().getRoot();

    var topLevelCategories = siteRootCategory.hasOnlineSubCategories()
        ? siteRootCategory.getOnlineSubCategories()
        : null;

    // The root ISML reads pdict.csrf.token for its <meta name="csrf-token">, and
    // every JSON mutation the frontend fires needs a valid token in its payload.
    // generateToken sets viewData.csrf (and no-ops when a route already ran it),
    // so one token serves both. Shared as always() so partial reloads — which is
    // how a mutation refreshes its props — never drop it.
    csrfProtection.generateToken(req, res, function () {});

    res.inertia.share({
        auth: {
            user: req.currentCustomer.profile ? {
                firstName: req.currentCustomer.profile.firstName,
                lastName: req.currentCustomer.profile.lastName,
                email: req.currentCustomer.profile.email
            } : null
        },
        locale: req.locale.id,
        navBar: new Categories(topLevelCategories),
        csrf: res.inertia.always(function () {
            return res.getViewData().csrf || null;
        })
    });

    next();
}

module.exports = shareData;
