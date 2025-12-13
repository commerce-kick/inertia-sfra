

/**
 * The class represent an entry within a Map.
 */
declare class MapEntry<K, V> {
    protected constructor();

	/**
	 * The entry's key.
	 */
	readonly key  :  K

	/**
	 * The entry's value.
	 */
	readonly value  :  V

}

export = MapEntry;
