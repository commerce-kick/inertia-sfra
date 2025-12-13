import ExtensibleObject = require('../object/ExtensibleObject');
import Collection = require('../util/Collection');
import EnumValue = require('../value/EnumValue');
import MediaFile = require('../content/MediaFile');
import ProductInventoryList = require('./ProductInventoryList');
import MarkupText = require('../content/MarkupText');
import StoreGroup = require('./StoreGroup');
import CustomAttributes = require('../object/CustomAttributes');

declare global {
    module ICustomAttributes {
        interface Store extends CustomAttributes {
        }
    }
}

/**
 * Represents a physical store in Commerce Cloud Digital with address, contact details,
 * coordinates, inventory management, and POS capabilities.
 */
declare class Store extends ExtensibleObject<ICustomAttributes.Store> {
