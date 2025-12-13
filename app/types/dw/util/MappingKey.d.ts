/**
 * Encapsulates the key for a mapping read in with the ImportKeyValueMapping job step. Can be either single or compound keys. For example, a single string (e.g. product id) or multiple string components (e.g. product id and site).
 */
declare class MappingKey {
	/**
	 * Gets the (possible compound) key. If the key consists of only of a single value, the string array will simply contain a single element.
	 */
	readonly keyComponents: string[]
	/**
	 * Gets a key that contains only a single key component (i.e. that is not a compound key). Returns null if this is not a single component key.
	 */
	readonly singleComponentKey: string | null


}


export = MappingKey;
