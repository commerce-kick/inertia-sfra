import CustomObject = require('./CustomObject');
import ObjectTypeDefinition = require('./ObjectTypeDefinition');
import SeekableIterator = require('../util/SeekableIterator');
import Map = require('../util/Map');
import CustomAttributes = require('../object/CustomAttributes');

declare global {
	interface ICustomObjectGetCustomObject {
		<T extends CustomAttributes>(type : string, keyValue : string | number) : CustomObject<T> | null
	}

	interface ICustomObjectQueryCustomObjects {
		<T extends CustomAttributes>(type : string, queryAttributes : Map<string, string>, sortstring : string) : SeekableIterator<CustomObject<T>>
		<T extends CustomAttributes>(type : string, querystring : string, sortstring : string, ...args : object[]) : SeekableIterator<CustomObject<T>>
	}

	interface ICustomObjectQueryCustomObject {
		<T extends CustomAttributes>(type : string, queryAttributes : Map<string, string>, sortstring : string) : CustomObject<T> | null;
		<T extends CustomAttributes>(type : string, querystring : string, sortstring : string, ...args : object[]) : CustomObject<T> | null;
	}
	interface ICustomObjectCreateCustomObject {
		<T extends CustomAttributes>(type : string, keyValue : string) : CustomObject<T>
	}

	interface ICustomObjectGetAllCustomObjects {
		<T extends CustomAttributes>(type : string) : SeekableIterator<CustomObject<T>>
	}
}

/**
 * Manager class which provides methods for creating, retrieving, deleting, and searching for custom objects.
To search for system objects, use SystemObjectMgr.
 */
declare class CustomObjectMgr {
    private constructor();

    /**
     * Returns a new custom object instance of the specified type, using the given key value.
     * @param type
     * @param keyValue
     */
    static createCustomObject: ICustomObjectCreateCustomObject


    /**
     * Returns all custom objects of a specific type.
     * @param type
     */
    static getAllCustomObjects: ICustomObjectGetAllCustomObjects

    /**
     * Returns a custom object based on it's type and unique key.
     * @param type
     * @param keyValue
     */
    static getCustomObject: ICustomObjectGetCustomObject


    /**
     * Searches for a single custom object instance.
     * @param type
     * @param querystring
     * @param args
     * @param */
    static queryCustomObject: ICustomObjectQueryCustomObject

    /**
     * Searches for custom object instances.
     * @param type
     * @param queryAttributes
     * @param sortstring
     */
    static queryCustomObjects: ICustomObjectQueryCustomObjects


    /**
     * Removes a given custom object.
     * @param object
     */
    static remove<T extends CustomAttributes>(object : CustomObject<T>) : void

}

export = CustomObjectMgr;
