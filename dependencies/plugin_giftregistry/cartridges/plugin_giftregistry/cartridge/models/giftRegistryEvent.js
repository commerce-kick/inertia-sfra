'use strict';

/**
 * Returns event details object
 * @param {Object} eventForm - event form object
 * @return {Object} returns object with event details
*/
function getEventDetails(eventForm) {
    return {
        eventName: eventForm.eventName.htmlValue,
        eventDate: eventForm.eventDate.htmlValue,
        eventCountry: eventForm.eventCountry.htmlValue,
        eventCity: eventForm.eventCity.htmlValue,
        eventState: eventForm.eventState ? eventForm.eventState.stateCode.htmlValue : false
    };
}

/**
 * Returns registrant information object
 * @param {Object} registrantForm - registrant form object
 * @return {Object} returns object with registrant details
*/
function getRegistrantDetails(registrantForm) {
    return {
        role: registrantForm.role.htmlValue,
        firstName: registrantForm.firstName.htmlValue,
        lastName: registrantForm.lastName.htmlValue,
        email: registrantForm.email.htmlValue
    };
}

/**
 * Returns co-registrant information object
 * @param {Object} coRegistrantForm - co-registrant form object
 * @param {boolean} hasCoRegistrant - boolean if there is co-registrant
 * @return {Object|boolean} returns object with co-registrant details or false
*/
function getCoRegistrantDetails(coRegistrantForm, hasCoRegistrant) {
    var object = false;
    if (hasCoRegistrant) {
        object = {
            role: coRegistrantForm.role.htmlValue,
            firstName: coRegistrantForm.firstName.htmlValue,
            lastName: coRegistrantForm.lastName.htmlValue,
            email: coRegistrantForm.email.htmlValue
        };
    }
    return object;
}

/**
 * Gift Registry Event class that represents details for Gift Registry
 * @param {Object} eventForm - event form object
 * @param {Object} registrantForm - registrant form object
 * @param {Object} coRegistrantForm - Co-Registrant form object
 * @param {boolean} hasCoRegistrant - flag to check if there is a co-registrant
 * @constructor
 */
function giftRegistryEvent(eventForm, registrantForm, coRegistrantForm, hasCoRegistrant) {
    this.eventForm = getEventDetails(eventForm);
    this.registrantForm = getRegistrantDetails(registrantForm);
    this.coRegistrantForm = getCoRegistrantDetails(coRegistrantForm, hasCoRegistrant);
}

module.exports = giftRegistryEvent;
