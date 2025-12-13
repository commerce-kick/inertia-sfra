import ExtensibleObject = require('./ExtensibleObject');
import CustomAttributes = require('./CustomAttributes');

/**
 * Represents a custom object and its corresponding attributes.
 */
declare class CustomObject<T extends CustomAttributes> extends ExtensibleObject<T> {
    private constructor();

    /**
     * The type of the CustomObject.
     */
    readonly type : string


}

export = CustomObject;
