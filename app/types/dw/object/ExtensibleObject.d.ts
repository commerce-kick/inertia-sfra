import PersistentObject = require('./PersistentObject');
import CustomAttributes = require('./CustomAttributes');
import ObjectTypeDefinition = require('./ObjectTypeDefinition');

declare class ExtensibleObject<T extends CustomAttributes> extends PersistentObject {
    custom : T;
}


export =  ExtensibleObject;

