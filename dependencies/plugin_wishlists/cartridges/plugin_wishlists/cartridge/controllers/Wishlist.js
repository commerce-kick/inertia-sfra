"use strict";

var server = require("server");
var consentTracking = require("*/cartridge/scripts/middleware/consentTracking");
var productListHelper = require("*/cartridge/scripts/productList/productListHelpers");
var csrfProtection = require("*/cartridge/scripts/middleware/csrf");
var Resource = require("dw/web/Resource");
var URLUtils = require("dw/web/URLUtils");
var ProductList = require("dw/customer/ProductList");
var PAGE_SIZE_ITEMS = 15;

server.get("GetListJson", function (req, res, next) {
    var result = {};
    var list = productListHelper.getCurrentOrNewList(req.currentCustomer.raw, {
        type: 10
    });
    var WishlistModel = require("*/cartridge/models/productList");
    var wishlistModel = new WishlistModel(list, {
        type: "wishlist",
        publicView: req.querystring.publicView || false,
        pageSize: PAGE_SIZE_ITEMS,
        pageNumber: req.querystring.pageNumber || 1
    }).productList;
    result.list = wishlistModel;
    result.success = true;
    res.json(result);
    next();
});

server.get("MoreList", function (req, res, next) {
    var publicView = req.querystring.publicView === "true" || false;
    var list;
    if (publicView && req.querystring.id) {
        var productListMgr = require("dw/customer/ProductListMgr");
        list = productListMgr.getProductList(req.querystring.id);
    } else {
        list = productListHelper.getList(req.currentCustomer.raw, { type: 10 });
    }
    var WishlistModel = require("*/cartridge/models/productList");
    var wishlistModel = new WishlistModel(list, {
        type: "wishlist",
        publicView: publicView,
        pageSize: PAGE_SIZE_ITEMS,
        pageNumber: req.querystring.pageNumber || 1
    }).productList;
    var publicOption = list.owner
        ? req.currentCustomer.raw.ID === list.owner.ID
        : false;

    res.render("/wishlist/components/list", {
        wishlist: wishlistModel,
        publicOption: publicOption,
        actionUrls: {
            updateQuantityUrl: ""
        }
    });
    next();
});

server.get(
    "Show",
    consentTracking.consent,
    server.middleware.https,
    csrfProtection.generateToken,
    function (req, res, next) {
        var list = productListHelper.getList(req.currentCustomer.raw, {
            type: 10
        });
        var WishlistModel = require("*/cartridge/models/productList");
        var userName = "";
        var firstName;
        var rememberMe = false;
        if (req.currentCustomer.credentials) {
            rememberMe = true;
            userName = req.currentCustomer.credentials.username;
        }
        var loggedIn = req.currentCustomer.profile;

        var target = req.querystring.rurl || 1;
        var actionUrl = URLUtils.url("Account-Login");
        var createAccountUrl = URLUtils.url(
            "Account-SubmitRegistration",
            "rurl",
            target
        )
            .relative()
            .toString();
        var navTabValue = req.querystring.action;
        var breadcrumbs = [
            {
                htmlValue: Resource.msg("global.home", "common", null),
                url: URLUtils.home().toString()
            }
        ];
        if (loggedIn) {
            firstName = req.currentCustomer.profile.firstName;
            breadcrumbs.push({
                htmlValue: Resource.msg(
                    "page.title.myaccount",
                    "account",
                    null
                ),
                url: URLUtils.url("Account-Show").toString()
            });
        }

        var profileForm = server.forms.getForm("profile");
        profileForm.clear();
        var wishlistModel = new WishlistModel(list, {
            type: "wishlist",
            publicView: false,
            pageSize: PAGE_SIZE_ITEMS,
            pageNumber: 1
        }).productList;
        res.render("/wishlist/wishlistLanding", {
            wishlist: wishlistModel,
            navTabValue: navTabValue || "login",
            rememberMe: rememberMe,
            userName: userName,
            actionUrl: actionUrl,
            actionUrls: {
                updateQuantityUrl: ""
            },
            profileForm: profileForm,
            breadcrumbs: breadcrumbs,
            oAuthReentryEndpoint: 1,
            loggedIn: loggedIn,
            firstName: firstName,
            socialLinks: loggedIn,
            publicOption: loggedIn,
            createAccountUrl: createAccountUrl
        });
        next();
    }
);

server.get("ShowOthers", consentTracking.consent, function (req, res, next) {
    var id = req.querystring.id;
    var productListMgr = require("dw/customer/ProductListMgr");
    var apiList = productListMgr.getProductList(id);
    var breadcrumbs = [
        {
            htmlValue: Resource.msg("global.home", "common", null),
            url: URLUtils.home().toString()
        }
    ];
    var loggedIn = req.currentCustomer.profile;
    if (loggedIn) {
        breadcrumbs.push({
            htmlValue: Resource.msg("page.title.myaccount", "account", null),
            url: URLUtils.url("Account-Show").toString()
        });
    }
    if (apiList) {
        if (apiList.owner.ID === req.currentCustomer.raw.ID) {
            res.redirect(URLUtils.url("Wishlist-Show"));
        }
        if (!apiList.public) {
            res.render("/wishlist/viewWishlist", {
                wishlist: null,
                breadcrumbs: breadcrumbs,
                loggedIn: loggedIn,
                privateList: true,
                errorMsg: Resource.msg(
                    "wishlist.not.viewable.text",
                    "wishlist",
                    null
                )
            });
        } else {
            var WishlistModel = require("*/cartridge/models/productList");
            var wishlistModel = new WishlistModel(apiList, {
                type: "wishlist",
                publicView: true,
                pageSize: PAGE_SIZE_ITEMS,
                pageNumber: 1,
                socialLinks: true
            }).productList;
            res.render("/wishlist/viewWishlist", {
                wishlist: wishlistModel,
                breadcrumbs: breadcrumbs,
                loggedIn: loggedIn,
                publicOption: false,
                privateList: false,
                errorMsg: "",
                socialLinks: true
            });
        }
    } else {
        res.render("/wishlist/viewWishlist", {
            wishlist: null,
            breadcrumbs: breadcrumbs,
            loggedIn: loggedIn,
            privateList: true,
            errorMsg: Resource.msg(
                "wishlist.not.viewable.text",
                "wishlist",
                null
            ),
            socialLinks: false
        });
    }
    next();
});

server.post("AddProduct", function (req, res, next) {
    var list = productListHelper.getCurrentOrNewList(req.currentCustomer.raw, {
        type: 10
    });
    var pid = req.form.pid;
    var optionId = req.form.optionId || null;
    var optionVal = req.form.optionVal || null;

    var config = {
        qty: 1,
        optionId: optionId,
        optionValue: optionVal,
        req: req,
        type: 10
    };
    var errMsg = productListHelper.itemExists(list, pid, config)
        ? Resource.msg("wishlist.addtowishlist.exist.msg", "wishlist", null)
        : Resource.msg("wishlist.addtowishlist.failure.msg", "wishlist", null);

    var success = productListHelper.addItem(list, pid, config);
    if (success) {
        res.json({
            success: true,
            pid: pid,
            msg: Resource.msg(
                "wishlist.addtowishlist.success.msg",
                "wishlist",
                null
            )
        });
    } else {
        res.json({
            error: true,
            pid: pid,
            msg: errMsg
        });
    }
    next();
});

server.get("RemoveProduct", function (req, res, next) {
    var list = productListHelper.removeItem(
        req.currentCustomer.raw,
        req.querystring.pid,
        { req: req, type: 10 }
    );
    var listIsEmpty = list.prodList.items.empty;

    res.json({
        success: true,
        listIsEmpty: listIsEmpty,
        emptyWishlistMsg: listIsEmpty
            ? Resource.msg("wishlist.empty.text", "wishlist", null)
            : ""
    });
    next();
});

server.get("RemoveProductAccount", function (req, res, next) {
    productListHelper.removeItem(req.currentCustomer.raw, req.querystring.pid, {
        req: req,
        type: ProductList.TYPE_WISH_LIST
    });
    var wishListAccount = require("*/cartridge/models/account/wishListAccount");
    var apiWishList = productListHelper.getList(req.currentCustomer.raw, {
        type: ProductList.TYPE_WISH_LIST
    });
    var wishlistAccountModel = {};
    wishListAccount(wishlistAccountModel, apiWishList);
    var areItemsPresentInWishlist = wishlistAccountModel.wishlist.length !== 0;

    res.render("account/wishlist/listCards", {
        account: {
            wishlist: wishlistAccountModel.wishlist
        },
        socialLinks: areItemsPresentInWishlist
    });

    next();
});

server.get("RemoveList", function (req, res, next) {
    var list = productListHelper.getList(req.currentCustomer.raw, { type: 10 });
    if (list) {
        productListHelper.removeList(req.currentCustomer.raw, list, null);
    }
    res.json({
        success: true
    });
    next();
});

server.get("GetProduct", function (req, res, next) {
    var ProductFactory = require("*/cartridge/scripts/factories/product");
    var renderTemplateHelper = require("*/cartridge/scripts/renderTemplateHelper");

    var requestUuid = req.querystring.uuid;
    var requestPid = req.querystring.pid;

    var product = {
        pid: requestPid
    };

    var context = {
        product: ProductFactory.get(product),
        uuid: requestUuid,
        closeButtonText: Resource.msg(
            "link.editProduct.close",
            "wishlist",
            null
        ),
        enterDialogMessage: Resource.msg(
            "msg.enter.edit.wishlist.product",
            "wishlist",
            null
        ),
        updateWishlistUrl: URLUtils.url("Wishlist-EditProductListItem"),
        template: "product/quickView.isml"
    };

    res.setViewData(context);

    // eslint-disable-next-line
    this.on("route:BeforeComplete", function (req, res) {
        // eslint-disable-line no-shadow
        var viewData = res.getViewData();

        res.json({
            renderedTemplate: renderTemplateHelper.getRenderedHtml(
                viewData,
                viewData.template
            )
        });
    });

    next();
});

server.post("EditProductListItem", function (req, res, next) {
    var ProductMgr = require("dw/catalog/ProductMgr");
    var collections = require("*/cartridge/scripts/util/collections");
    var requestUuid = req.form.uuid;
    var newProductId = req.form.pid;

    var productList = productListHelper.getList(req.currentCustomer.raw, {
        type: 10
    });
    var requestListItem = collections.find(productList.items, function (item) {
        return item.UUID === requestUuid;
    });
    var previousProductId = requestListItem.productID;
    var config = { qty: 1 };

    var newItemExist = productListHelper.getItemFromList(
        productList,
        newProductId
    );

    if (newItemExist) {
        if (newItemExist.UUID !== requestUuid) {
            productListHelper.removeItem(
                req.currentCustomer.raw,
                previousProductId,
                { req: req, type: 10 }
            );
        }
    } else {
        try {
            var Transaction = require("dw/system/Transaction");
            Transaction.wrap(function () {
                var previousItem = productListHelper.getItemFromList(
                    productList,
                    previousProductId
                );
                productList.removeItem(previousItem);

                var apiProduct = ProductMgr.getProduct(newProductId);

                if (!apiProduct.variationGroup && apiProduct) {
                    var productlistItem =
                        productList.createProductItem(apiProduct);
                    if (apiProduct.optionProduct) {
                        var optionModel = apiProduct.getOptionModel();
                        var option = optionModel.getOption(config.optionId);
                        var optionValue = optionModel.getOptionValue(
                            option,
                            config.optionValue
                        );
                        optionModel.setSelectedOptionValue(option, optionValue);
                        productlistItem.setProductOptionModel(optionModel);
                    }
                    productlistItem.setQuantityValue(config.qty);
                }
            });
            productListHelper.updateWishlistPrivacyCache(
                req.currentCustomer.raw,
                req,
                { type: 10 }
            );
        } catch (e) {
            res.json({
                error: true
            });
            return next();
        }
    }
    res.json({
        success: true
    });

    return next();
});

server.get("Search", consentTracking.consent, function (req, res, next) {
    var breadcrumbs = [
        {
            htmlValue: Resource.msg("global.home", "common", null),
            url: URLUtils.home().toString()
        }
    ];
    var actionUrl = URLUtils.url("Wishlist-Results");

    res.render("/wishlist/search", {
        breadcrumbs: breadcrumbs,
        actionUrl: actionUrl
    });
    next();
});

server.post("Results", consentTracking.consent, function (req, res, next) {
    var WishlistSearchModel = require("*/cartridge/models/wishlist/search");
    var breadcrumbs = [
        {
            htmlValue: Resource.msg("global.home", "common", null),
            url: URLUtils.home().toString()
        }
    ];

    var firstName = req.form.searchFirstName;
    var lastName = req.form.searchLastName;
    var email = req.form.searchEmail;
    var config = {
        pageSize: 8,
        pageNumber: 1,
        uuids: []
    };
    var results = new WishlistSearchModel(firstName, lastName, email, config);

    if (results.hits.length === 1) {
        res.redirect(results.hits[0].url);
    }

    res.render("/wishlist/results", {
        breadcrumbs: breadcrumbs,
        results: results
    });
    next();
});

server.post("MoreResults", function (req, res, next) {
    var WishlistSearchModel = require("*/cartridge/models/wishlist/search");
    var firstName = req.form.firstName;
    var lastName = req.form.lastName;
    var email = "";
    var config = {
        uuids: req.form.uuids,
        pageNumber: JSON.parse(req.form.pageNumber),
        pageSize: 8
    };
    var results = new WishlistSearchModel(firstName, lastName, email, config);
    res.json({
        results: results
    });
    next();
});

module.exports = server.exports();
