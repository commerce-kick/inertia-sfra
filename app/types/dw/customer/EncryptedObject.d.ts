import ExtensibleObject = require('../object/ExtensibleObject');
import CustomAttributes = require('../object/CustomAttributes');

declare class EncryptedObject<T extends CustomAttributes> extends ExtensibleObject<T> {

}

export = EncryptedObject;
