'use strict';

/**
 * Performs the actions needed to display the registry selector page
 * @param {dw.customer.Customer} currentCustomer - Global customer object
 * @param {Object} queryString - Object containing query string parameters
 * @returns {Object} containing registries
 */
function selectRegistry(currentCustomer, queryString) {
    var ProductListMgr = require('dw/customer/ProductListMgr');
    var MiniRegistryModel = require('*/cartridge/models/miniRegistry');
    var URLUtils = require('dw/web/URLUtils');

    var productLists = ProductListMgr.getProductLists(currentCustomer, 11).toArray();

    if (!queryString.args) {
        return { error: true };
    }

    productLists.sort(function (a, b) {
        var result;
        if (new Date(a.eventDate) < new Date(b.eventDate)) {
            result = -1;
        } else if (new Date(a.eventDate) > new Date(b.eventDate)) {
            result = 1;
        } else {
            result = 0;
        }
        return result;
    });

    var result = productLists.map(function (productList) {
        return new MiniRegistryModel(productList, queryString.args);
    });

    return {
        error: false,
        registries: result,
        createRegistryLink: URLUtils.url('GiftRegistry-Begin', 'args', queryString.args)
    };
}

/**
 * Determines whether or not to add a product to the registry or to show the registry selector page
 * @param {Object} req - Request object
 * @returns {Object} returns an object that contains information if the product was added or
 *      if there was an error or if there are multiple registries
 */
function addProductProcessHelper(req) {
    var ProductListMgr = require('dw/customer/ProductListMgr');
    var productListHelper = require('*/cartridge/scripts/productList/productListHelpers');

    var result;

    if (!req.querystring.args) {
        result = { error: true, productAdded: false, multipleRegistries: false };
        return result;
    }

    var args = JSON.parse(decodeURIComponent(req.querystring.args));

    if (!args.pid) {
        result = { error: true, productAdded: false, multipleRegistries: false };
        return result;
    }

    var productLists = ProductListMgr.getProductLists(req.currentCustomer.raw, 11);
    var numOfProductLists = productLists.getLength();

    if (productLists && numOfProductLists === 1) {
        var config = {
            qty: parseInt(args.qty, 10) || 1,
            optionId: args.optionId,
            optionValue: args.optionVal,
            req: req,
            type: 11
        };

        var addProductToRegistryResult = productListHelper.addItem(productLists.iterator().next(), args.pid, config);

        if (!addProductToRegistryResult) {
            result = { error: true, productAdded: false, multipleRegistries: false };

            return result;
        }

        result = {
            error: false, productAdded: true, multipleRegistries: false, args: args
        };
    } else {
        result = {
            error: false, productAdded: false, multipleRegistries: true, args: args
        };
    }

    return result;
}

/**
 * Returns true if the address exists and false if it does not.
 * @param {string} newAddressID - addressID being submitted
 * @param {string} oldAddressID - addressID to check against
 * @param {dw.customer.AddressBook} addressBook - current customers address book
 * @returns {boolean} return value based on existence of the addressID
 */
function checkForExistingAddressID(newAddressID, oldAddressID, addressBook) {
    if (oldAddressID !== newAddressID || oldAddressID === 'new') {
        var address = addressBook.getAddress(newAddressID);
        if (address) {
            return true;
        }
    }
    return false;
}

/**
 * Applies the edits to the product lists based on the submitted form
 * @param {Object} form - submitted form from client side
 * @param {dw.customer.ProductList} apiList - gift registry
 * @param {dw.customer.AddressBook} addressBook - current customers address book
 * @returns {boolean} value on if the edit was succesful
 */
function edit(form, apiList, addressBook) {
    var Transaction = require('dw/system/Transaction');
    var address;
    var addressUUID;
    var success;
    Transaction.wrap(function () {
        switch (form.eventFormType) {
            case 'event':
                apiList.setName(form.dwfrm_giftRegistry_giftRegistryEvent_event_eventName);
                apiList.setEventCity(form.dwfrm_giftRegistry_giftRegistryEvent_event_eventCity);
                var dateSplit = form.dwfrm_giftRegistry_giftRegistryEvent_event_eventDate.split('/');
                var eventDate = new Date(
                    parseInt(dateSplit[2], 10),
                    (parseInt(dateSplit[0], 10) - 1),
                    parseInt(dateSplit[1], 10)
                );
                apiList.setEventDate(new Date(eventDate));
                apiList.setEventCountry(form.dwfrm_giftRegistry_giftRegistryEvent_event_eventCountry);
                apiList.setEventState(form.dwfrm_giftRegistry_giftRegistryEvent_event_eventState_stateCode);
                success = true;
                break;
            case 'registrant':
                var registrant = apiList.getRegistrant();
                registrant.setEmail(form.dwfrm_giftRegistry_giftRegistryEvent_registrant_email);
                registrant.setFirstName(form.dwfrm_giftRegistry_giftRegistryEvent_registrant_firstName);
                registrant.setLastName(form.dwfrm_giftRegistry_giftRegistryEvent_registrant_lastName);
                registrant.setRole(form.dwfrm_giftRegistry_giftRegistryEvent_registrant_role);
                success = true;
                break;
            case 'coRegistrant':
                var coRegistrant = apiList.getCoRegistrant();

                if (!coRegistrant) {
                    coRegistrant = apiList.createCoRegistrant();
                }

                coRegistrant.setEmail(form.dwfrm_giftRegistry_giftRegistryEvent_coRegistrant_email);
                coRegistrant.setFirstName(form.dwfrm_giftRegistry_giftRegistryEvent_coRegistrant_firstName);
                coRegistrant.setLastName(form.dwfrm_giftRegistry_giftRegistryEvent_coRegistrant_lastName);
                coRegistrant.setRole(form.dwfrm_giftRegistry_giftRegistryEvent_coRegistrant_role);
                success = true;
                break;
            case 'preEvent':
                if (form.grAddressSelector === 'new') {
                    address = addressBook.createAddress(form.dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_addressId);
                } else {
                    address = addressBook.getAddress(form.grAddressSelector);

                    if (address) {
                        address.setID(form.dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_addressId);
                    }
                }
                if (address) {
                    address.setFirstName(form.dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_firstName);
                    address.setLastName(form.dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_lastName);
                    address.setAddress1(form.dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_address1);

                    if (form.dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_address2) {
                        address.setAddress2(form.dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_address2);
                    } else {
                        address.setAddress2('');
                    }
                    address.setCity(form.dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_city);

                    if (form.dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_states_stateCode) {
                        address.setStateCode(form.dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_states_stateCode);
                    }

                    address.setCountryCode(form.dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_country);
                    address.setPostalCode(form.dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_postalCode);
                    address.setPhone(form.dwfrm_giftRegistry_giftRegistryShippingAddress_preEventShippingAddress_phone);
                    apiList.setShippingAddress(address);
                    success = true;
                    addressUUID = address.getUUID();
                }
                break;
            case 'postEvent':

                if (form.post_grAddressSelector === 'new') {
                    address = addressBook.createAddress(form.dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_addressId);
                } else {
                    address = addressBook.getAddress(form.post_grAddressSelector);

                    if (address) {
                        address.setID(form.dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_addressId);
                    }
                }
                if (address) {
                    address.setFirstName(form.dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_firstName);
                    address.setLastName(form.dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_lastName);
                    address.setAddress1(form.dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_address1);

                    if (form.dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_address2) {
                        address.setAddress2(form.dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_address2);
                    } else {
                        address.setAddress2('');
                    }

                    address.setCity(form.dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_city);

                    if (form.dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_states_stateCode) {
                        address.setStateCode(form.dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_states_stateCode);
                    }

                    address.setCountryCode(form.dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_country);
                    address.setPostalCode(form.dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_postalCode);
                    address.setPhone(form.dwfrm_giftRegistry_giftRegistryShippingAddress_postEventShippingAddress_phone);
                    apiList.setPostEventShippingAddress(address);
                    success = true;
                    addressUUID = address.getUUID();
                }
                break;
            default:
                success = false;
        }
    });

    return {
        success: success,
        addressUUID: addressUUID
    };
}

/**
 * Returns a POJO date object from the api date object
 * @param {Date} dateObj - submitted form from client side
 * @returns {Object} object with the values broken up into d/m/y
 */
function getDateObj(dateObj) {
    var day = dateObj.getDate();
    if (day < 10) {
        day = '0' + day;
    }

    var month = dateObj.getMonth() + 1;
    if (month < 10) {
        month = '0' + month;
    } else {
        month += '';
    }

    return {
        d: day,
        m: month,
        y: dateObj.getFullYear().toString()
    };
}

module.exports = {
    edit: edit,
    selectRegistry: selectRegistry,
    addProductProcessHelper: addProductProcessHelper,
    checkForExistingAddressID: checkForExistingAddressID,
    getDateObj: getDateObj
};
