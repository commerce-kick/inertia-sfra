'use strict';

var AddressModel = require('*/cartridge/models/address');
var collections = require('*/cartridge/scripts/util/collections');

/**
 * Returns the matching address UUID for a shipping address
 * @param {dw.order.Shipment} shipment - a shipment of the current basket
 * @param {dw.customer.Customer} customer - current customer from the request object
 * @return {string|boolean} returns matching UUID or false
*/
function getCustomerAddressUUID(shipment, customer) {
    var shippingAddress = shipment.shippingAddress;
    var matchingUUID = false;

    if (customer && customer.addressBook && customer.addressBook.addresses) {
        var matchingAddress = collections.find(customer.addressBook.addresses, function (address) {
            return address && address.isEquivalentAddress(shippingAddress);
        });
        matchingUUID = matchingAddress ? matchingAddress.UUID : false;
    }

    return matchingUUID;
}

/**
 * Creates object that represents shipment addresses for address selector
 * @param {dw.util.Collection} shipments - all shipments of the current basket
 * @param {dw.customer.Customer} customer - current customer from the request object
 * @returns {List} a plain list of objects that contains shipment addresses for selector
 */
function getShippingAddresses(shipments, customer) {
    var ShippingMethodModel = require('*/cartridge/models/shipping/shippingMethod');
    var addressObject = {};
    var result = collections.map(shipments, function (shipment) {
        addressObject = new AddressModel(shipment.shippingAddress);
        addressObject.UUID = shipment.UUID;
        addressObject.isStore = shipment.custom && shipment.custom.fromStoreId ? shipment.custom.fromStoreId : false;
        addressObject.selectedShippingMethod = new ShippingMethodModel(shipment.shippingMethod, shipment);
        addressObject.isDefaultShipment = shipment.isDefault();
        addressObject.selectedCustomerAddressUUID = getCustomerAddressUUID(shipment, customer);
        return addressObject;
    });

    return result;
}

/**
 * Creates object that represents customer addresses for address selector
 * @param {dw.customer.Customer} customer - current customer from the request object
 * @returns {List} a plain list of objects that contains customer addresses for selector
 */
function getCustomerAddresses(customer) {
    var addressObject = {};
    var result = [];
    if (customer && customer.addressBook && customer.addressBook.addresses.length) {
        var preferredAddressID = customer.addressBook.preferredAddress.ID;
        result = collections.map(customer.addressBook.addresses, function (address) {
            addressObject = new AddressModel(address);
            addressObject.isPreferredAddress = preferredAddressID === address.ID;
            addressObject.UUID = address.UUID;
            return addressObject;
        });
    }
    return result;
}

/**
 * creates a plain object that contains addresses' information for address selector
 * @param {dw.order.Basket} basket - current basket
 * @param {dw.customer.Customer} customer - current customer from the request object
 * @returns {Object} an object that contains addresses for selector
 */
function createAddressesObject(basket, customer) {
    var customerAddresses = getCustomerAddresses(customer);
    var shipmentAddresses = customer && basket ? getShippingAddresses(basket.shipments, customer) : null;
    return {
        shipmentAddresses: shipmentAddresses,
        customerAddresses: customerAddresses
    };
}

/**
 * Address class that represents addresses for address selector
 * @param {dw.order.Basket} basket - current basket
 * @param {dw.customer.Customer} customer - current customer from the request object
 * @constructor
 */
function addresses(basket, customer) {
    this.addresses = createAddressesObject(basket, customer);
}

module.exports = addresses;
