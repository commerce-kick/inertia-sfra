import ExtensibleObject = require('./ExtensibleObject');
import CustomAttributes = require('./CustomAttributes');


declare global {
    module ICustomAttributes {
        interface ActiveData extends CustomAttributes{
        }
    }
}

declare class ActiveData extends ExtensibleObject<ICustomAttributes.ActiveData> {

}

export = ActiveData;
