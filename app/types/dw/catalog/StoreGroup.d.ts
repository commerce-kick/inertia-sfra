import ExtensibleObject = require('../object/ExtensibleObject');
import Collection = require('../util/Collection');
import Store = require('./Store')
import CustomAttributes = require('../object/CustomAttributes');

declare global {
    module ICustomAttributes {
        interface StoreGroup extends CustomAttributes{
        }
    }
}

declare class StoreGroup extends ExtensibleObject<ICustomAttributes.StoreGroup> {
    private constructor();

    /**
     * The ID of the store group.
     */
    readonly ID : string

    /**
     * The name of the store group.
     */
    readonly name  :  string
    
    /**
     * All the stores that are assigned to the store group.
     */ 
    readonly stores  :  Collection<Store>


}


export = StoreGroup;
