'use strict';

var server = require('server');
var Resource = require('dw/web/Resource');
var URLUtils = require('dw/web/URLUtils');

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var giftRegistryMiddleware = require('*/cartridge/scripts/middleware/addProductToRegistry');
var productListHelper = require('*/cartridge/scripts/productList/productListHelpers');
var userLoggedIn = require('*/cartridge/scripts/middleware/userLoggedIn');

var PAGE_SIZE_ITEMS = 15;
var PAGE_SIZE = 8;

/**
 * merges 1 object into another
 * @param {Object} resultObject - the object to which the other object is merged into
 * @param {Object} formErrors - The object that gets merged into the other
 * @returns {Object} An object that contains the values of both objects
 */
function mergeObject(resultObject, formErrors) {
    Object.keys(formErrors).forEach(function (key) {
        resultObject[key] = formErrors[key]; // eslint-disable-line no-param-reassign
    });

    return resultObject;
}

server.get('Begin', server.middleware.https, userLoggedIn.validateLoggedIn, csrfProtection.generateToken, function (req, res, next) {
    var AddressSelectorModel = require('*/cartridge/models/addressSelector');
    var addressSelectorModel = new AddressSelectorModel(null, req.currentCustomer.raw);

    var registryForm = server.forms.getForm('giftRegistry');
    registryForm.clear();

    var currentCustomer = req.currentCustomer.raw;
    registryForm.giftRegistryEvent.registrant.firstName.htmlValue = currentCustomer.profile.firstName;
    registryForm.giftRegistryEvent.registrant.lastName.htmlValue = currentCustomer.profile.lastName;
    registryForm.giftRegistryEvent.registrant.email.htmlValue = currentCustomer.profile.email;

    var breadcrumbs = [
        {
            htmlValue: Resource.msg('global.home', 'common', null),
            url: URLUtils.home().toString()
        },
        {
            htmlValue: Resource.msg('page.title.myaccount', 'account', null),
            url: URLUtils.url('Account-Show').relative().toString()
        }
    ];

    var actionUrls = {
        validateShipping: URLUtils.url('GiftRegistry-SubmitShipping').relative().toString(),
        validateEventandRegistrant: URLUtils.url('GiftRegistry-SubmitEventInfo').relative().toString(),
        createRegistry: URLUtils.url('GiftRegistry-CreateRegistry').relative().toString()
    };

    if (req.querystring.args) {
        actionUrls.createRegistry = URLUtils.url('GiftRegistry-CreateRegistry', 'args', req.querystring.args).relative().toString();
    }

    res.render('giftRegistry/createGiftRegistry', {
        form: registryForm,
        breadcrumbs: breadcrumbs,
        actionUrls: actionUrls,
        showEditForm: false,
        addressSelector: addressSelectorModel,
        // This empty object is added to avoid isml template error
        giftRegistryModel: {
            eventInfo: {},
            registrant: {},
            coRegistrant: {},
            preEventShippingAddress: {},
            postEventShippingAddress: {}
        }
    });
    next();
});

server.get('SubmitEventInfo', server.middleware.https, userLoggedIn.validateLoggedInAjax, function (req, res, next) {
    var formsErrorHelpers = require('*/cartridge/scripts/formErrors');
    var GiftRegistryEvent = require('*/cartridge/models/giftRegistryEvent');

    var data = res.getViewData();
    if (data && !data.loggedin) {
        res.json();
        return next();
    }

    var coRegistrantFormErrors;
    var form = server.forms.getForm('giftRegistry');
    var formErrors = {};

    var eventForm = form.giftRegistryEvent.event;

    // Check date entry
    var dateString = eventForm.eventDate.htmlValue;
    var dateSplit = dateString.split('-');
    var eventDate = new Date(
        parseInt(dateSplit[0], 10),
        (parseInt(dateSplit[1], 10) - 1),
        parseInt(dateSplit[2], 10)
    );
    var currentDate = new Date();

    if (eventDate < currentDate) {
        eventForm.eventDate.valid = false;
        eventForm.eventDate.error = Resource.msg('error.invalid.date', 'giftRegistry', null);
    } else {
        eventForm.eventDate.htmlValue = eventDate.toLocaleDateString();
    }

    var hasCoRegistrantCheck = form.coRegistrantCheck.checked;
    var registrantForm = form.giftRegistryEvent.registrant;
    var coRegistrantForm = form.giftRegistryEvent.coRegistrant;

    var eventFormErrors = formsErrorHelpers.getFormErrors(eventForm);
    var registrantFormErrors = formsErrorHelpers.getFormErrors(registrantForm);

    if (hasCoRegistrantCheck) {
        coRegistrantFormErrors = formsErrorHelpers.getFormErrors(coRegistrantForm);
    }

    formErrors = mergeObject(formErrors, eventFormErrors);
    formErrors = mergeObject(formErrors, registrantFormErrors);

    if (coRegistrantFormErrors) {
        formErrors = mergeObject(formErrors, coRegistrantFormErrors);
    }

    if (Object.keys(formErrors).length > 0) {
        res.setStatusCode(500);
    }

    form.clear();

    var giftRegistryEvent = new GiftRegistryEvent(eventForm, registrantForm, coRegistrantForm, hasCoRegistrantCheck);

    res.json({
        fields: formErrors,
        giftRegistryEvent: giftRegistryEvent
    });

    return next();
});

server.get('SubmitShipping', server.middleware.https, userLoggedIn.validateLoggedInAjax, function (req, res, next) {
    var formsErrorHelpers = require('*/cartridge/scripts/formErrors');

    var data = res.getViewData();
    if (data && !data.loggedin) {
        res.json();
        return next();
    }

    var form = server.forms.getForm('giftRegistry');
    var formErrors = {};
    var hasPostShippingAddress = form.postShippingCheck.checked;
    var postShippingAddressForm = form.giftRegistryShippingAddress.postEventShippingAddress;
    var preShippingAddressForm = form.giftRegistryShippingAddress.preEventShippingAddress;

    var postShippingAddressFormErrors;
    var preShippingAddressFormErrors = formsErrorHelpers.getFormErrors(preShippingAddressForm);

    if (hasPostShippingAddress) {
        postShippingAddressFormErrors = formsErrorHelpers.getFormErrors(postShippingAddressForm);
    }

    formErrors = mergeObject(formErrors, preShippingAddressFormErrors);

    if (postShippingAddressFormErrors) {
        formErrors = mergeObject(formErrors, postShippingAddressFormErrors);
    }

    if (Object.keys(formErrors).length > 0) {
        res.setStatusCode(500);
    }

    form.clear();

    res.json({
        fields: formErrors,
        preEventShippingAddress: preShippingAddressForm,
        postEventShippingAddress: postShippingAddressForm,
        hasPostShippingAddress: hasPostShippingAddress
    });

    return next();
});

server.post('Edit', server.middleware.https, userLoggedIn.validateLoggedInAjax, csrfProtection.validateAjaxRequest, function (req, res, next) {
    var formsErrorHelpers = require('*/cartridge/scripts/formErrors');
    var registryHelpers = require('*/cartridge/scripts/helpers/giftRegistryHelpers');
    var productListMgr = require('dw/customer/ProductListMgr');
    var serverForm = server.forms.getForm('giftRegistry');
    var AddressSelectorModel = require('*/cartridge/models/addressSelector');
    var renderTemplateHelper = require('*/cartridge/scripts/renderTemplateHelper');

    var data = res.getViewData();
    if (data && !data.loggedin) {
        res.json();
        return next();
    }

    var editStatus;
    var form = req.form;
    var apiList;
    var list;
    var result = {
        success: false
    };
    var currentCustomer = req.currentCustomer.raw;
    var addressBook = currentCustomer.getAddressBook();
    var formToEdit;
    apiList = productListMgr.getProductList(form.registryID);
    if (apiList && apiList.owner.ID === req.currentCustomer.raw.ID) {
        switch (form.eventFormType) {
            case 'event':
                formToEdit = serverForm.giftRegistryEvent.event;
                break;
            case 'registrant':
                formToEdit = serverForm.giftRegistryEvent.registrant;
                break;
            case 'coRegistrant':
                formToEdit = serverForm.giftRegistryEvent.coRegistrant;
                break;
            case 'preEvent':
                formToEdit = serverForm.giftRegistryShippingAddress.preEventShippingAddress;
                break;
            case 'postEvent':
                formToEdit = serverForm.giftRegistryShippingAddress.postEventShippingAddress;
                break;
            // no default
        }
        result.fields = formsErrorHelpers.getFormErrors(formToEdit);
        if (form.eventFormType === 'preEvent'
            && registryHelpers.checkForExistingAddressID(form.dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_addressId, form.grAddressSelector, addressBook)
            && form.addressID === 'new'
        ) {
            formToEdit.addressId.valid = false;
            formToEdit.valid = false;
            if (!Object.prototype.hasOwnProperty.call(result, 'fields')) { result.fields = {}; }
            result.fields.dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_addressId = Resource.msg('error.used.address.id', 'forms', null);
        }
        if (form.eventFormType === 'postEvent'
            && registryHelpers.checkForExistingAddressID(form.dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_addressId, form.grAddressSelector, addressBook)
            && form.addressID === 'new'
        ) {
            formToEdit.addressId.valid = false;
            formToEdit.valid = false;
            if (!Object.prototype.hasOwnProperty.call(result, 'fields')) { result.fields = {}; }
            result.fields.dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_addressId = Resource.msg('error.used.address.id', 'forms', null);
        }
        if (Object.keys(result.fields).length === 0) {
            editStatus = registryHelpers.edit(form, apiList, addressBook);
            result.success = editStatus.success;
            result.addressUUID = editStatus.addressUUID;
            list = productListHelper.getList(currentCustomer, { type: 11, id: form.registryID });
            switch (form.eventFormType) {
                case 'event':
                    var dateObj = registryHelpers.getDateObj(list.eventDate);
                    var dateString = Resource.msgf('date.html.value.txt', 'giftRegistry', null, dateObj.m, dateObj.d, dateObj.y);
                    result.data = {
                        eventName: list.name,
                        eventCity: list.eventCity,
                        eventCountry: list.eventCountry,
                        eventDate: dateString,
                        eventState: list.eventState
                    };
                    break;
                case 'registrant':
                    result.data = {
                        email: list.registrant.email,
                        firstName: list.registrant.firstName,
                        lastName: list.registrant.lastName,
                        role: list.registrant.role
                    };
                    break;
                case 'coRegistrant':
                    result.data = {
                        email: list.coRegistrant.email,
                        firstName: list.coRegistrant.firstName,
                        lastName: list.coRegistrant.lastName,
                        role: list.coRegistrant.role
                    };
                    break;
                case 'preEvent':
                    result.data = {
                        address1: list.shippingAddress.address1,
                        address2: list.shippingAddress.address2 || '',
                        city: list.shippingAddress.city,
                        firstName: list.shippingAddress.firstName,
                        lastName: list.shippingAddress.lastName,
                        phone: list.shippingAddress.phone,
                        postalCode: list.shippingAddress.postalCode,
                        id: list.shippingAddress.ID,
                        countryCode: list.shippingAddress.countryCode.value
                    };

                    if (list.shippingAddress.stateCode) {
                        result.data.stateCode = list.shippingAddress.stateCode;
                    }

                    break;
                case 'postEvent':
                    result.data = {
                        address1: list.postEventShippingAddress.address1,
                        address2: list.postEventShippingAddress.address2 || '',
                        city: list.postEventShippingAddress.city,
                        firstName: list.postEventShippingAddress.firstName,
                        lastName: list.postEventShippingAddress.lastName,
                        phone: list.postEventShippingAddress.phone,
                        postalCode: list.postEventShippingAddress.postalCode,
                        id: list.postEventShippingAddress.ID,
                        countryCode: list.postEventShippingAddress.countryCode.value
                    };

                    if (list.postEventShippingAddress.stateCode) {
                        result.data.stateCode = list.postEventShippingAddress.stateCode;
                    }

                    break;
                // no default
            }
        }
    }
    if (result.success && (form.eventFormType === 'preEvent' || form.eventFormType === 'postEvent')) {
        var addresses = new AddressSelectorModel(null, req.currentCustomer.raw).addresses.customerAddresses;
        result.addressUUID = form.addressUUID;

        addresses.forEach(function (address) {
            if (address.UUID === form.addressUUID) {
                result.editedAddress = address;
                result.editedAddressLabel = Resource.msgf('address.dropdown.label', 'giftRegistry', null, address.address.addressId, address.address.firstName, ' ' + address.address.lastName, ' ' + address.address.address1, ' ' + (address.address.address2 ? address.address.address2 : ''), ' ' + (address.address.stateCode ? address.address.stateCode : ''), ' ' + address.address.city, ' ' + address.address.postalCode);
                result.newAddress = false;
            }
            if (address.address.addressId === form.dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_addressId || address.address.addressId === form.dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_addressId) {
                result.editedAddress = address;
                result.editedAddressLabel = Resource.msgf('address.dropdown.label', 'giftRegistry', null, address.address.addressId, address.address.firstName, ' ' + address.address.lastName, ' ' + address.address.address1, ' ' + (address.address.address2 ? address.address.address2 : ''), ' ' + (address.address.stateCode ? address.address.stateCode : ''), ' ' + address.address.city, ' ' + address.address.postalCode);
                result.newAddress = true;
                result.renderedOption = renderTemplateHelper.getRenderedHtml({ address: address }, 'giftRegistry/components/addressSelectorContext.isml');
            }
        });
    }

    res.json(result);

    return next();
});

server.post('CreateRegistry', server.middleware.https, userLoggedIn.validateLoggedInAjax, csrfProtection.validateAjaxRequest, function (req, res, next) {
    var data = res.getViewData();
    if (data && !data.loggedin) {
        res.json();
        return next();
    }

    var form = req.form;
    var customer = req.currentCustomer.raw;
    var addressBook = customer.getAddressBook();
    var addressAlreadyExists = null;
    var postAddressAlreadyExists = null;
    var preEventaddressID = null;

    var formData = {
        eventInfo: {},
        registrant: {},
        coRegistrant: {},
        preEventAddress: {},
        postEventAddress: {}
    };

    if (form.dwfrm_giftRegistry_giftRegistryEvent_event_eventName
        && form.dwfrm_giftRegistry_giftRegistryEvent_event_eventDate
        && form.dwfrm_giftRegistry_giftRegistryEvent_event_eventCountry
        && form.dwfrm_giftRegistry_giftRegistryEvent_event_eventCity
    ) {
        formData.eventInfo.eventName = form.dwfrm_giftRegistry_giftRegistryEvent_event_eventName;
        formData.eventInfo.eventDate = form.dwfrm_giftRegistry_giftRegistryEvent_event_eventDate;
        formData.eventInfo.eventCountry = form.dwfrm_giftRegistry_giftRegistryEvent_event_eventCountry;
        formData.eventInfo.eventState = form.dwfrm_giftRegistry_giftRegistryEvent_event_eventState_stateCode || null;
        formData.eventInfo.eventCity = form.dwfrm_giftRegistry_giftRegistryEvent_event_eventCity;
    }

    if (form.dwfrm_giftRegistry_giftRegistryEvent_registrant_role
        && form.dwfrm_giftRegistry_giftRegistryEvent_registrant_firstName
        && form.dwfrm_giftRegistry_giftRegistryEvent_registrant_lastName
        && form.dwfrm_giftRegistry_giftRegistryEvent_registrant_email
    ) {
        formData.registrant.role = form.dwfrm_giftRegistry_giftRegistryEvent_registrant_role;
        formData.registrant.firstName = form.dwfrm_giftRegistry_giftRegistryEvent_registrant_firstName;
        formData.registrant.lastName = form.dwfrm_giftRegistry_giftRegistryEvent_registrant_lastName;
        formData.registrant.email = form.dwfrm_giftRegistry_giftRegistryEvent_registrant_email;
    }

    if (form.dwfrm_giftRegistry_coRegistrantCheck
        && form.dwfrm_giftRegistry_giftRegistryEvent_coRegistrant_role
        && form.dwfrm_giftRegistry_giftRegistryEvent_coRegistrant_firstName
        && form.dwfrm_giftRegistry_giftRegistryEvent_coRegistrant_lastName
        && form.dwfrm_giftRegistry_giftRegistryEvent_coRegistrant_email
    ) {
        formData.coRegistrant.role = form.dwfrm_giftRegistry_giftRegistryEvent_coRegistrant_role;
        formData.coRegistrant.firstName = form.dwfrm_giftRegistry_giftRegistryEvent_coRegistrant_firstName;
        formData.coRegistrant.lastName = form.dwfrm_giftRegistry_giftRegistryEvent_coRegistrant_lastName;
        formData.coRegistrant.email = form.dwfrm_giftRegistry_giftRegistryEvent_coRegistrant_email;
    } else {
        formData.coRegistrant = null;
    }

    if (form.dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_addressId
        && form.dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_firstName
        && form.dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_lastName
        && form.dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_address1
        && form.dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_country
        && form.dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_city
        && form.dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_postalCode
        && form.dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_phone
        && form.address_saved === 'new'
    ) {
        preEventaddressID = form.dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_addressId;
        formData.preEventAddress.addressId = form.dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_addressId;
        formData.preEventAddress.firstName = form.dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_firstName;
        formData.preEventAddress.lastName = form.dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_lastName;
        formData.preEventAddress.address1 = form.dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_address1;
        formData.preEventAddress.address2 = form.dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_address2 || null;
        formData.preEventAddress.country = form.dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_country;
        formData.preEventAddress.stateCode = form.dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_states_stateCode || null;
        formData.preEventAddress.city = form.dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_city;
        formData.preEventAddress.postalCode = form.dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_postalCode;
        formData.preEventAddress.phone = form.dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_phone;
        addressAlreadyExists = addressBook.getAddress(formData.preEventAddress.addressId);
        formData.preEventAddress.newAddress = true;
        formData.preEventAddress.id = null;
    } else if (form.address_saved === 'saved') {
        formData.preEventAddress.newAddress = false;
        formData.preEventAddress.addressId = form.grAddressSelector;
        preEventaddressID = form.grAddressSelector;
    }

    if (form.dwfrm_giftRegistry_postShippingCheck
        && form.dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_addressId
        && form.dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_firstName
        && form.dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_lastName
        && form.dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_address1
        && form.dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_country
        && form.dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_city
        && form.dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_postalCode
        && form.dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_phone
        && form.post_address_saved === 'new'
    ) {
        formData.postEventAddress.addressId = form.dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_addressId;
        formData.postEventAddress.firstName = form.dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_firstName;
        formData.postEventAddress.lastName = form.dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_lastName;
        formData.postEventAddress.address1 = form.dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_address1;
        formData.postEventAddress.address2 = form.dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_address2 || null;
        formData.postEventAddress.country = form.dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_country;
        formData.postEventAddress.stateCode = form.dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_states_stateCode || null;
        formData.postEventAddress.city = form.dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_city;
        formData.postEventAddress.postalCode = form.dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_postalCode;
        formData.postEventAddress.phone = form.dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_phone;
        postAddressAlreadyExists = (preEventaddressID === form.dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_addressId) || addressBook.getAddress(formData.postEventAddress.addressId);
        formData.postEventAddress.newAddress = true;
    } else if (form.post_address_saved === 'saved') {
        formData.postEventAddress.newAddress = false;
        formData.postEventAddress.addressId = form.post_grAddressSelector;
    } else {
        formData.postEventAddress = null;
    }

    var list;
    if ((addressAlreadyExists && form.address_saved === 'new') || (postAddressAlreadyExists && form.post_address_saved === 'new')) {
        res.json({
            success: false,
            index: 1,
            addressAlreadyExists: !!addressAlreadyExists,
            postAddressAlreadyExists: !!postAddressAlreadyExists,
            errorMsg: Resource.msg('error.used.address.id', 'forms', null)
        });
    } else {
        list = productListHelper.createList(
            req.currentCustomer.raw,
            {
                type: 11,
                formData: formData
            }
        );

        if (list) {
            res.json({
                success: true,
                ID: list.ID,
                url: URLUtils.url('GiftRegistry-Show', 'id', list.ID).toString()
            });
        } else {
            res.json({
                success: false,
                index: 1,
                addressAlreadyExists: !!addressAlreadyExists,
                postAddressAlreadyExists: !!postAddressAlreadyExists,
                errorMsg: Resource.msg('error.creating.registry', 'forms', null)
            });
        }
    }

    return next();
}, giftRegistryMiddleware.addToRegistry);

server.get('Show', server.middleware.https, csrfProtection.generateToken, userLoggedIn.validateLoggedIn, function (req, res, next) {
    var id = req.querystring.id;
    var list = productListHelper.getList(req.currentCustomer.raw, { type: 11, id: id });
    var GiftRegistryModel = require('*/cartridge/models/giftRegistry');
    var giftRegistryModel;
    var navTabValue = req.querystring.action;

    var AddressSelectorModel = require('*/cartridge/models/addressSelector');
    var addressSelectorModel = new AddressSelectorModel(null, req.currentCustomer.raw);

    if (list && list.owner.ID === req.currentCustomer.raw.ID) {
        giftRegistryModel = new GiftRegistryModel(
            list,
            {
                type: 'giftregistry',
                publicView: req.querystring.publicView || false,
                pageSize: PAGE_SIZE_ITEMS,
                pageNumber: req.querystring.pageNumber || 1
            }
        ).productList;
    } else {
        giftRegistryModel = null;
    }

    var form = server.forms.getForm('giftRegistry');
    form.clear();
    var eventForm = form.giftRegistryEvent.event;

    eventForm.eventDate.htmlValue = giftRegistryModel.eventInfo.date;
    eventForm.eventName.htmlValue = giftRegistryModel.name;
    eventForm.eventCountry.htmlValue = giftRegistryModel.eventInfo.country;

    if (eventForm.eventState && giftRegistryModel.eventInfo.state) {
        eventForm.eventState.htmlValue = giftRegistryModel.eventInfo.state;
    }

    eventForm.eventCity.htmlValue = giftRegistryModel.eventInfo.city;

    var registrantForm = form.giftRegistryEvent.registrant;
    registrantForm.email.htmlValue = giftRegistryModel.registrant.email;
    registrantForm.firstName.htmlValue = giftRegistryModel.registrant.firstName;
    registrantForm.lastName.htmlValue = giftRegistryModel.registrant.lastName;
    registrantForm.role.htmlValue = giftRegistryModel.registrant.role;

    var coRegistrantForm = form.giftRegistryEvent.coRegistrant;
    if (giftRegistryModel.coRegistrant) {
        coRegistrantForm.email.htmlValue = giftRegistryModel.coRegistrant.email || '';
        coRegistrantForm.firstName.htmlValue = giftRegistryModel.coRegistrant.firstName || '';
        coRegistrantForm.lastName.htmlValue = giftRegistryModel.coRegistrant.lastName || '';
        coRegistrantForm.role.htmlValue = giftRegistryModel.coRegistrant.role || '';
    }

    var postEventShippingAddress = form.giftRegistryShippingAddress.postEventShippingAddress;
    if (giftRegistryModel.postEventShippingAddress) {
        postEventShippingAddress.addressId.htmlValue = giftRegistryModel.postEventShippingAddress.name;
        postEventShippingAddress.address1.htmlValue = giftRegistryModel.postEventShippingAddress.address1;
        postEventShippingAddress.address2.htmlValue = giftRegistryModel.postEventShippingAddress.address2;
        postEventShippingAddress.city.htmlValue = giftRegistryModel.postEventShippingAddress.city;
        postEventShippingAddress.country.htmlValue = giftRegistryModel.postEventShippingAddress.country.value;
        postEventShippingAddress.firstName.htmlValue = giftRegistryModel.postEventShippingAddress.firstName;
        postEventShippingAddress.lastName.htmlValue = giftRegistryModel.postEventShippingAddress.lastName;
        postEventShippingAddress.phone.htmlValue = giftRegistryModel.postEventShippingAddress.phone;
        postEventShippingAddress.postalCode.htmlValue = giftRegistryModel.postEventShippingAddress.postalCode;
        if (postEventShippingAddress.states && giftRegistryModel.postEventShippingAddress.stateCode) {
            postEventShippingAddress.states.htmlValue = giftRegistryModel.postEventShippingAddress.stateCode;
        }
    }

    var preEventShippingAddress = form.giftRegistryShippingAddress.preEventShippingAddress;
    preEventShippingAddress.addressId.htmlValue = giftRegistryModel.preEventShippingAddress.name;
    preEventShippingAddress.address1.htmlValue = giftRegistryModel.preEventShippingAddress.address1;
    preEventShippingAddress.address2.htmlValue = giftRegistryModel.preEventShippingAddress.address2;
    preEventShippingAddress.city.htmlValue = giftRegistryModel.preEventShippingAddress.city;
    preEventShippingAddress.country.htmlValue = giftRegistryModel.preEventShippingAddress.country.value;
    preEventShippingAddress.firstName.htmlValue = giftRegistryModel.preEventShippingAddress.firstName;
    preEventShippingAddress.lastName.htmlValue = giftRegistryModel.preEventShippingAddress.lastName;
    preEventShippingAddress.phone.htmlValue = giftRegistryModel.preEventShippingAddress.phone;
    preEventShippingAddress.postalCode.htmlValue = giftRegistryModel.preEventShippingAddress.postalCode;

    if (preEventShippingAddress.states && giftRegistryModel.preEventShippingAddress.stateCode) {
        preEventShippingAddress.states.htmlValue = giftRegistryModel.preEventShippingAddress.stateCode;
    }

    var breadcrumbs = [
        {
            htmlValue: Resource.msg('global.home', 'common', null),
            url: URLUtils.home().toString()
        },
        {
            htmlValue: Resource.msg('page.title.myaccount', 'account', null),
            url: URLUtils.url('Account-Show').relative().toString()
        }
    ];

    res.render('giftRegistry/giftRegistry', {
        breadcrumbs: breadcrumbs,
        giftRegistryModel: giftRegistryModel,
        navTabValue: navTabValue || 'registryContent',
        showEditForm: true,
        addressSelector: addressSelectorModel,
        makePublicURL: URLUtils.url('ProductList-TogglePublic', 'ID', giftRegistryModel.ID, 'type', 11),
        form: form,
        editRegistryUrl: URLUtils.url('GiftRegistry-Edit').relative().toString(),
        addToCartURL: URLUtils.url('Cart-AddProductListItem').relative().toString(),
        moreItemsUrl: URLUtils.url('GiftRegistry-MoreItems').relative().toString(),
        showMoreButton: giftRegistryModel.total > PAGE_SIZE_ITEMS,
        pageSize: PAGE_SIZE_ITEMS,
        pageNumber: 2,
        totalNumber: giftRegistryModel.items.length,
        fullPageRequest: true
    });

    next();
});

server.get('MoreItems', server.middleware.https, function (req, res, next) {
    var pageNumber = req.querystring.pageNumber;
    var productListMgr = require('dw/customer/ProductListMgr');
    var apiList = req.querystring.publicView
        ? productListMgr.getProductList(req.querystring.id)
        : productListHelper.getList(req.currentCustomer.raw, { type: 11, id: req.querystring.id });
    var GiftRegistryModel = require('*/cartridge/models/giftRegistry');
    var giftRegistryModel = new GiftRegistryModel(
        apiList,
        {
            type: 'giftregistry',
            publicView: req.querystring.publicView === 'true',
            pageSize: PAGE_SIZE_ITEMS,
            pageNumber: pageNumber || 1
        }
    ).productList;
    res.render('giftRegistry/components/itemList', {
        moreItemsUrl: URLUtils.url('GiftRegistry-MoreItems').relative().toString(),
        pageSize: PAGE_SIZE_ITEMS,
        pageNumber: parseInt(req.querystring.pageNumber, 10) + 1,
        totalNumber: giftRegistryModel.total,
        showMoreButton: giftRegistryModel.total > (PAGE_SIZE_ITEMS * pageNumber),
        giftRegistryModel: giftRegistryModel,
        fullPageRequest: false
    });
    next();
});

server.get('ShowOthers', server.middleware.https, function (req, res, next) {
    var id = req.querystring.id;
    var productListMgr = require('dw/customer/ProductListMgr');
    var apiList = productListMgr.getProductList(id);
    var GiftRegistryModel = require('*/cartridge/models/giftRegistry');
    var giftRegistryModel;
    var breadcrumbs = [
        {
            htmlValue: Resource.msg('global.home', 'common', null),
            url: URLUtils.home().toString()
        }
    ];
    var loggedIn = req.currentCustomer.profile;
    if (loggedIn) {
        breadcrumbs.push({
            htmlValue: Resource.msg('page.title.myaccount', 'account', null),
            url: URLUtils.url('Account-Show').relative().toString()
        });
    }
    if (apiList) {
        if (apiList.owner.ID === req.currentCustomer.raw.ID) {
            res.redirect(URLUtils.url('GiftRegistry-Show', 'id', id));
        }
        if (!apiList.public) {
            res.render('giftRegistry/giftRegistry', {
                breadcrumbs: breadcrumbs,
                giftRegistryModel: null,
                loggedIn: loggedIn,
                navTabValue: null,
                makePublicURL: '',
                addToCartURL: URLUtils.url('Cart-AddProductListItem').relative().toString()
            });
        } else {
            giftRegistryModel = new GiftRegistryModel(
                apiList,
                {
                    type: 'giftregistry',
                    publicView: true,
                    pageSize: PAGE_SIZE_ITEMS,
                    pageNumber: 1
                }
            ).productList;

            res.render('giftRegistry/giftRegistry', {
                breadcrumbs: breadcrumbs,
                giftRegistryModel: giftRegistryModel,
                loggedIn: loggedIn,
                navTabValue: null,
                makePublicURL: '',
                moreItemsUrl: URLUtils.url('GiftRegistry-MoreItems').relative().toString(),
                pageSize: PAGE_SIZE_ITEMS,
                pageNumber: 2,
                totalNumber: giftRegistryModel.total,
                showMoreButton: giftRegistryModel.total > PAGE_SIZE_ITEMS,
                actionUrls: {
                    updateQuantityUrl: ''
                },
                addToCartURL: URLUtils.url('Cart-AddProductListItem').relative().toString(),
                fullPageRequest: true
            });
        }
    } else {
        res.render('giftRegistry/giftRegistry', {
            breadcrumbs: breadcrumbs,
            giftRegistryModel: null,
            loggedIn: loggedIn,
            navTabValue: null,
            showEditForm: false,
            makePublicURL: '',
            moreItemsUrl: '',
            pageSize: PAGE_SIZE_ITEMS,
            pageNumber: 2,
            totalNumber: 0,
            showMoreButton: false,
            addToCartURL: URLUtils.url('Cart-AddProductListItem').relative().toString(),
            fullPageRequest: true
        });
    }
    next();
});

server.get('RemoveList', server.middleware.https, userLoggedIn.validateLoggedInAjax, function (req, res, next) {
    var ProductListMgr = require('dw/customer/ProductListMgr');
    var giftRegistryListDecorator = require('*/cartridge/models/account/decorators/giftRegistryList');
    var renderTemplateHelper = require('*/cartridge/scripts/renderTemplateHelper');

    var data = res.getViewData();
    if (data && !data.loggedin) {
        res.json();
        return next();
    }

    var id = req.querystring.id;
    var pageSize = req.querystring.pageSize || PAGE_SIZE;
    var pageNumber = req.querystring.pageNumber || 1;
    var list = ProductListMgr.getProductList(id);

    productListHelper.removeList(req.currentCustomer.raw, list, null);

    var apiGiftRegistryList = ProductListMgr.getProductLists(req.currentCustomer.raw, '11');
    var giftRegistryListModel = {};
    giftRegistryListDecorator(giftRegistryListModel, apiGiftRegistryList, pageSize, pageNumber);

    var moreResults = pageSize === 2 ? false : apiGiftRegistryList.length > (pageSize * pageNumber);

    var accountContext = {
        account: { giftRegistryList: giftRegistryListModel.giftRegistryList },
        pageSize: pageSize,
        pageNumber: 2,
        moreResults: moreResults,
        moreButtonUrl: URLUtils.url('GiftRegistry-GetManagedLists').relative().toString(),
        totalNumber: apiGiftRegistryList.length
    };
    var listCardBodyTemplate = 'giftRegistry/listCardBody';
    var renderHTML = renderTemplateHelper.getRenderedHtml(
        accountContext,
        listCardBodyTemplate
    );

    res.json({
        renderHTML: renderHTML,
        listIsEmpty: apiGiftRegistryList.getLength()
    });

    return next();
});

server.get('RemoveProduct', server.middleware.https, userLoggedIn.validateLoggedInAjax, function (req, res, next) {
    var GiftRegistryModel = require('*/cartridge/models/giftRegistry');
    var renderTemplateHelper = require('*/cartridge/scripts/renderTemplateHelper');

    var data = res.getViewData();
    if (data && !data.loggedin) {
        res.json();
        return next();
    }

    var cust = req.currentCustomer.raw;
    var pid = req.querystring.pid; // item pid to remove
    var id = req.querystring.id; // giftregistry list id
    var UUID = req.querystring.UUID;
    var list = productListHelper.removeItem(cust, pid, { req: req, type: 11, id: id });
    var giftRegistryList = productListHelper.getList(req.currentCustomer.raw, { type: 11, id: id });
    if (list.error) {
        res.setStatusCode(500);
        res.json({
            success: false,
            errorMessage: Resource.msg('removeGiftRegistry.item.failure.msg', 'giftRegistry', null),
            renderHTML: false
        });
        return next();
    }

    var giftRegistryModel = new GiftRegistryModel(
        giftRegistryList,
        {
            type: 'giftregistry',
            publicView: false,
            pageSize: PAGE_SIZE_ITEMS,
            pageNumber: 1
        }
    ).productList;
    var renderHTML = renderTemplateHelper.getRenderedHtml(
        {
            giftRegistryModel: giftRegistryModel,
            addToCartURL: URLUtils.url('Cart-AddProductListItem').relative().toString(),
            showMoreButton: giftRegistryModel.total > (PAGE_SIZE_ITEMS * 1),
            fullPageRequest: false,
            totalNumber: giftRegistryModel.total,
            pageNumber: 2,
            pageSize: PAGE_SIZE_ITEMS,
            moreItemsUrl: URLUtils.url('GiftRegistry-MoreItems').relative().toString()
        },
        'giftRegistry/components/itemList'
    );
    res.json({
        success: true,
        listIsEmpty: list.prodList.items.empty,
        addNewItemURL: URLUtils.url('Home-Show').relative().toString(),
        addNewItemText: Resource.msg('link.addItems.giftRegistry', 'giftRegistry', null),
        UUID: UUID,
        renderHTML: renderHTML
    });
    return next();
});

server.get('ClearList', server.middleware.https, userLoggedIn.validateLoggedInAjax, function (req, res, next) {
    var data = res.getViewData();
    if (data && !data.loggedin) {
        res.json();
        return next();
    }

    var result = {};
    var hasError = false;
    var gitRegistryList = productListHelper.getList(req.currentCustomer.raw, { type: 11, id: req.querystring.id });
    if (gitRegistryList && gitRegistryList.items) {
        var Transaction = require('dw/system/Transaction');
        try {
            Transaction.wrap(function () {
                gitRegistryList.items.toArray().forEach(function (item) {
                    gitRegistryList.removeItem(item);
                    result.prodList = gitRegistryList;
                    return result;
                });
            });
        } catch (e) {
            hasError = true;
        }
    } else {
        hasError = true;
    }
    if (hasError) {
        res.setStatusCode(500);
        res.json({
            success: false,
            errorMessage: Resource.msg('clearGiftRegistry.items.faliure.msg', 'giftRegistry', null)
        });
    } else {
        res.json({
            success: true,
            listIsEmpty: result.prodList.items.empty
        });
    }
    return next();
});

server.get('GetListJson', server.middleware.https, function (req, res, next) {
    var result = {};
    var id = req.querystring.id;
    var list = productListHelper.getList(req.currentCustomer.raw, { type: 11, id: id });
    var GiftRegistryModel = require('*/cartridge/models/giftRegistry');
    var giftRegistryModel;

    if (list.owner.ID === req.currentCustomer.raw.ID) {
        giftRegistryModel = new GiftRegistryModel(
            list,
            {
                type: 'giftregistry',
                publicView: req.querystring.publicView || false,
                pageSize: PAGE_SIZE_ITEMS,
                pageNumber: req.querystring.pageNumber || 1
            }
        ).productList;
    } else {
        giftRegistryModel = null;
    }

    result.list = giftRegistryModel;
    result.success = true;
    res.json(result);
    next();
});

server.get('ShowLists', server.middleware.https, function (req, res, next) {
    var ProductListMgr = require('dw/customer/ProductListMgr');
    var lists = ProductListMgr.getProductLists(req.currentCustomer.raw, 11).toArray();
    var result = [];
    lists.forEach(function (list) {
        result.push(list.UUID);
    });
    res.json({
        success: true,
        result: result
    });
    next();
});

server.get('Select', server.middleware.https, userLoggedIn.validateLoggedIn, function (req, res, next) {
    var registryHelpers = require('*/cartridge/scripts/helpers/giftRegistryHelpers');

    var selectRegistryHelperResult = registryHelpers.selectRegistry(
        req.currentCustomer.raw,
        req.querystring
    );

    if (selectRegistryHelperResult.error) {
        res.redirect(URLUtils.url('Error-Start'));
    } else {
        res.render('giftRegistry/selectRegistry', selectRegistryHelperResult);
    }

    next();
});

server.post('AddProduct', server.middleware.https, userLoggedIn.validateLoggedInAjax, function (req, res, next) {
    var result;

    var data = res.getViewData();
    if (data && !data.loggedin) {
        res.json();
        return next();
    }

    if (!req.querystring.args || !req.querystring.id) {
        res.setStatusCode(500);
        res.json({ error: true, redirectUrl: URLUtils.url('Error-Start').toString() });
        return next();
    }

    var args = JSON.parse(decodeURIComponent(req.querystring.args));

    var id = req.querystring.id;
    var list = productListHelper.getList(req.currentCustomer.raw, { type: 11, id: id });

    var config = {
        qty: parseInt(args.qty, 10) || 1,
        optionId: args.optionId,
        optionValue: args.optionVal,
        req: req,
        type: 11
    };

    result = productListHelper.addItem(list, args.pid, config);

    if (!result) {
        res.json({ error: true, redirectUrl: URLUtils.url('Error-Start').toString() });
        return next();
    }

    var showPid = args.prodSetPid || args.pid;
    res.json({ error: false, redirectUrl: URLUtils.url('Product-Show', 'pid', showPid).relative().toString() });

    return next();
});

server.get('AddProductIntercept', server.middleware.https, userLoggedIn.validateLoggedIn, function (req, res, next) {
    var registryHelpers = require('*/cartridge/scripts/helpers/giftRegistryHelpers');

    var AddProductHelperResult = registryHelpers.addProductProcessHelper(req);

    if (AddProductHelperResult.error) {
        res.redirect(URLUtils.url('Error-Start'));
    } else if (AddProductHelperResult.multipleRegistries) {
        var selectRegistryHelperResult = registryHelpers.selectRegistry(
            req.currentCustomer.raw,
            req.querystring
        );

        if (selectRegistryHelperResult.error) {
            res.redirect(URLUtils.url('Error-Start'));
        } else {
            res.render('giftRegistry/selectRegistry', selectRegistryHelperResult);
        }
    } else if (AddProductHelperResult.productAdded) {
        var productHelper = require('*/cartridge/scripts/helpers/productHelpers');

        var showPid = AddProductHelperResult.args.prodSetPid || AddProductHelperResult.args.pid;
        var showProductPageHelperResult = productHelper.showProductPage(
            { pid: showPid, quantity: AddProductHelperResult.args.qty },
            req.pageMetaData
        );

        if (!showProductPageHelperResult.product.online && showProductPageHelperResult.product.productType !== 'set') {
            res.setStatusCode(404);
            res.render('error/notFound');
        } else {
            res.render(showProductPageHelperResult.template, {
                product: showProductPageHelperResult.product,
                addToCartUrl: showProductPageHelperResult.addToCartUrl,
                resources: showProductPageHelperResult.resources,
                breadcrumbs: showProductPageHelperResult.breadcrumbs
            });
        }
    }

    next();
});

server.get('AddProductInterceptAjax', server.middleware.https, userLoggedIn.validateLoggedInAjax, function (req, res, next) {
    var registryHelpers = require('*/cartridge/scripts/helpers/giftRegistryHelpers');

    var data = res.getViewData();
    if (data && !data.loggedin) {
        res.json();
        return next();
    }

    var AddProductHelperResult = registryHelpers.addProductProcessHelper(req);

    if (AddProductHelperResult.error) {
        res.setStatusCode(500);
        res.json({
            error: AddProductHelperResult.error,
            redirectUrl: URLUtils.url('Error-Start').relative().toString()
        });
    } else if (AddProductHelperResult.multipleRegistries) {
        res.json({
            error: false,
            redirectUrl: URLUtils.url('GiftRegistry-Select', 'args', req.querystring.args).relative().toString()
        });
    } else if (AddProductHelperResult.productAdded) {
        res.json({
            error: false,
            redirectUrl: null,
            msg: Resource.msg('msg.product.added.to.registry.success', 'giftRegistry', 'null')
        });
    }

    return next();
});

server.get('Manage', server.middleware.https, userLoggedIn.validateLoggedIn, function (req, res, next) {
    var ProductListMgr = require('dw/customer/ProductListMgr');
    var giftRegistryListDecorator = require('*/cartridge/models/account/decorators/giftRegistryList');

    var productLists = ProductListMgr.getProductLists(req.currentCustomer.raw, 11);
    var giftRegistryListModel = {};
    var pageSize = PAGE_SIZE;
    var pageNumber = 1;
    giftRegistryListDecorator(giftRegistryListModel, productLists, pageSize, pageNumber);
    var breadcrumbs = [
        {
            htmlValue: Resource.msg('global.home', 'common', null),
            url: URLUtils.home().toString()
        },
        {
            htmlValue: Resource.msg('link.header.myaccount', 'account', null),
            url: URLUtils.url('Account-Show').relative().toString()
        }
    ];

    res.render('/giftRegistry/manageList', {
        breadcrumbs: breadcrumbs,
        moreResults: productLists.length > (pageSize * pageNumber),
        pageSize: pageSize,
        pageNumber: pageNumber + 1,
        totalNumber: productLists.length,
        moreButtonUrl: URLUtils.url('GiftRegistry-GetManagedLists').relative().toString(),
        account: { giftRegistryList: giftRegistryListModel.giftRegistryList }
    });

    return next();
});

server.get('GetManagedLists', server.middleware.https, userLoggedIn.validateLoggedIn, function (req, res, next) {
    var ProductListMgr = require('dw/customer/ProductListMgr');
    var giftRegistryListDecorator = require('*/cartridge/models/account/decorators/giftRegistryList');

    var productLists = ProductListMgr.getProductLists(req.currentCustomer.raw, 11);
    var giftRegistryListModel = {};
    var pageSize = req.querystring.pageSize ? req.querystring.pageSize : productLists.length;
    var pageNumber = req.querystring.pageNumber ? req.querystring.pageNumber : 1;
    giftRegistryListDecorator(giftRegistryListModel, productLists, pageSize, pageNumber);

    res.render('/giftRegistry/moreList', {
        giftRegistryList: giftRegistryListModel.giftRegistryList
    });
    return next();
});

server.get('GetSearchedListsJSON', server.middleware.https, function (req, res, next) {
    var ProductListMgr = require('dw/customer/ProductListMgr');
    var giftRegistryListDecorator = require('*/cartridge/models/account/decorators/giftRegistryList');
    var productLists = ProductListMgr.getProductLists(req.currentCustomer.raw, 11);
    var giftRegistryListModel = {};
    var pageSize = req.querystring.pageSize ? req.querystring.pageSize : productLists.length;
    var pageNumber = req.querystring.pageNumber ? req.querystring.pageNumber : 1;
    giftRegistryListDecorator(giftRegistryListModel, productLists, pageSize, pageNumber); // need to add public/private flag
    var moreResults = productLists.length > (pageSize * pageNumber);

    res.json({
        giftRegistryList: giftRegistryListModel.giftRegistryList,
        moreResults: moreResults
    });

    return next();
});

server.get('GetProduct', server.middleware.https, function (req, res, next) {
    var ProductFactory = require('*/cartridge/scripts/factories/product');
    var renderTemplateHelper = require('*/cartridge/scripts/renderTemplateHelper');

    var requestDesiredQty = req.querystring.desiredQuantity;
    var purchasedQty = parseInt(req.querystring.purchasedQuantity, 10);
    var disabledAttribute = purchasedQty > 0;

    var product = {
        pid: req.querystring.pid,
        quantity: requestDesiredQty
    };

    var context = {
        product: ProductFactory.get(product),
        id: req.querystring.id,
        uuid: req.querystring.UUID,
        selectedQuantity: requestDesiredQty,
        purchasedQuantity: purchasedQty,
        disabledAttribute: disabledAttribute,
        giftRegistryEdit: true,
        closeButtonText: Resource.msg('link.editProduct.close', 'giftRegistry', null),
        enterDialogMessage: Resource.msg('msg.enter.edit.gift.registry.product', 'giftRegistry', null),
        updateGiftRegistryUrl: URLUtils.url('GiftRegistry-EditProductListItem'),
        template: 'product/quickView.isml'
    };

    res.setViewData(context);

    this.on('route:BeforeComplete', function (req, res) { // eslint-disable-line no-shadow
        var viewData = res.getViewData();

        res.json({
            renderedTemplate: renderTemplateHelper.getRenderedHtml(viewData, viewData.template)
        });
    });

    next();
});

server.post('EditProductListItem', server.middleware.https, userLoggedIn.validateLoggedInAjax, function (req, res, next) {
    var ProductMgr = require('dw/catalog/ProductMgr');
    var collections = require('*/cartridge/scripts/util/collections');
    var GiftRegistryModel = require('*/cartridge/models/giftRegistry');
    var Transaction = require('dw/system/Transaction');
    var renderTemplateHelper = require('*/cartridge/scripts/renderTemplateHelper');

    var data = res.getViewData();
    if (data && !data.loggedin) {
        res.json();
        return next();
    }

    var requestUuid = req.form.uuid;
    var requestId = req.form.id;
    var newProductId = req.form.pid;
    var newQuantityDesired = req.form.quantityDesired;

    var giftRegistryList = productListHelper.getList(req.currentCustomer.raw, { type: 11, id: requestId });
    var requestListItem = collections.find(giftRegistryList.items, function (item) {
        return item.UUID === requestUuid;
    });
    var currentProductId = requestListItem.productID;

    var config = {
        qty: parseInt(newQuantityDesired, 10)
    };

    var existingMatchingProduct = productListHelper.getItemFromList(giftRegistryList, newProductId);

    if (existingMatchingProduct) {
        var totalQty = config.qty;

        try {
            Transaction.wrap(function () {
                if (existingMatchingProduct.UUID !== requestUuid) {
                    totalQty = config.qty + existingMatchingProduct.quantityValue;

                    var currentItem = productListHelper.getItemFromList(giftRegistryList, currentProductId);
                    giftRegistryList.removeItem(currentItem);
                }

                existingMatchingProduct.setQuantityValue(totalQty);
            });
        } catch (e) {
            return next();
        }
    } else {
        try {
            Transaction.wrap(function () {
                var currentItem = productListHelper.getItemFromList(giftRegistryList, currentProductId);
                giftRegistryList.removeItem(currentItem);

                var apiProduct = ProductMgr.getProduct(newProductId);
                if (!apiProduct.variationGroup && apiProduct) {
                    var productlistItem = giftRegistryList.createProductItem(apiProduct);
                    if (apiProduct.optionProduct) {
                        var optionModel = apiProduct.getOptionModel();
                        var option = optionModel.getOption(config.optionId);
                        var optionValue = optionModel.getOptionValue(option, config.optionValue);
                        optionModel.setSelectedOptionValue(option, optionValue);
                        productlistItem.setProductOptionModel(optionModel);
                    }
                    productlistItem.setQuantityValue(config.qty);
                }
            });
        } catch (e) {
            return next();
        }
    }

    var giftRegistryModel = new GiftRegistryModel(
        giftRegistryList,
        {
            type: 'giftregistry',
            publicView: false,
            pageSize: PAGE_SIZE_ITEMS,
            pageNumber: 1
        }
    ).productList;

    var giftRegistryContext = {
        giftRegistryModel: giftRegistryModel,
        addToCartURL: URLUtils.url('Cart-AddProductListItem').relative().toString(),
        showMoreButton: giftRegistryModel.total > (PAGE_SIZE_ITEMS * 1),
        fullPageRequest: false,
        totalNumber: giftRegistryModel.total,
        pageNumber: 2,
        pageSize: PAGE_SIZE_ITEMS,
        moreItemsUrl: URLUtils.url('GiftRegistry-MoreItems').relative().toString()
    };
    giftRegistryList = renderTemplateHelper.getRenderedHtml(
        giftRegistryContext,
        '/giftRegistry/components/itemList.isml'
    );

    res.json({
        giftRegistryList: giftRegistryList
    });

    return next();
});

server.get('Landing', server.middleware.https, function (req, res, next) {
    var addressForm = server.forms.getForm('address');
    addressForm.clear();

    var breadcrumbs = [
        {
            htmlValue: Resource.msg('global.home', 'common', null),
            url: URLUtils.home().toString()
        },
        {
            htmlValue: Resource.msg('page.title.myaccount', 'account', null),
            url: URLUtils.url('Account-Show').relative().toString()
        }
    ];
    var urlCreateGR = URLUtils.url('GiftRegistry-Begin', 'rurl', '5').relative().toString();
    var urlManageGR = URLUtils.url('GiftRegistry-Manage', 'rurl', '4').relative().toString();
    var urlSearchGR = URLUtils.url('GiftRegistry-Search').relative().toString();

    res.render('giftRegistry/giftRegistryLanding', {
        breadcrumbs: breadcrumbs,
        urlCreateGR: urlCreateGR,
        urlManageGR: urlManageGR,
        urlSearchGR: urlSearchGR,
        pageSize: PAGE_SIZE,
        pageNumber: 1,
        totalNumber: 0,
        moreButtonUrl: URLUtils.url('GiftRegistry-MoreSearchResults').relative().toString(),
        states: addressForm.states ? addressForm.states.stateCode : false,
        countries: addressForm.country
    });
    next();
});

server.post('Search', function (req, res, next) {
    var GiftRegistrySearchModel = require('*/cartridge/models/search');
    var form = req.form;
    var config = {
        month: form.searchEventMonth,
        year: form.searchEventYear,
        email: form.searchGREmail,
        city: form.searchGRCity,
        country: form.searchGRCountry,
        name: form.searchGRName,
        state: form.searchGRState,
        pageSize: PAGE_SIZE,
        pageNumber: 1
    };
    var results = new GiftRegistrySearchModel(form.searchFirstName, form.searchLastName, config);

    var result = {
        success: results ? !!results : false,
        results: results,
        moreResults: results.total > (config.pageSize * config.pageNumber)
    };

    res.json(result);
    return next();
});

server.get('MoreSearchResults', function (req, res, next) {
    var GiftRegistrySearchModel = require('*/cartridge/models/search');

    var config = {
        month: req.querystring.searchEventMonth,
        year: req.querystring.searchEventYear,
        email: req.querystring.searchGREmail,
        city: req.querystring.searchGRCity,
        country: req.querystring.searchGRCountry,
        name: req.querystring.searchGRName,
        state: req.querystring.searchGRState,
        pageSize: PAGE_SIZE,
        pageNumber: req.querystring.pageNumber

    };
    var results = new GiftRegistrySearchModel(req.querystring.firstName, req.querystring.lastName, config);

    var result = {
        success: results ? !!results : false,
        results: results,
        moreResults: results.total > (config.pageSize * config.pageNumber),
        pageNumber: req.querystring.pageNumber
    };

    res.json(result);
    return next();
});

module.exports = server.exports();
