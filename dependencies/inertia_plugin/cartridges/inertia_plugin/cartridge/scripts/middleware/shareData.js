'use strict';

/**
 * Middleware to share global data with Inertia
 */
function shareData(req, res, next) {
    var catalogMgr = require("dw/catalog/CatalogMgr");
    var Categories = require("*/cartridge/models/categories");
    
    // Check if Inertia is initialized
    if (!res.inertia) {
        return next();
    }

    var siteRootCategory = catalogMgr.getSiteCatalog().getRoot();

    var topLevelCategories = siteRootCategory.hasOnlineSubCategories()
        ? siteRootCategory.getOnlineSubCategories()
        : null;

    res.inertia.share({
        auth: {
            user: req.currentCustomer.profile ? {
                firstName: req.currentCustomer.profile.firstName,
                lastName: req.currentCustomer.profile.lastName,
                email: req.currentCustomer.profile.email
            } : null
        },
        locale: req.locale.id,
        navBar: new Categories(topLevelCategories)
    });

    next();
}

module.exports = shareData;
