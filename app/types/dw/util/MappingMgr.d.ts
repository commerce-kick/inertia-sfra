import Collection = require('./Collection');
import MappingKey = require('./MappingKey')
import SeekableIterator = require('./SeekableIterator')

/**
 * Used to manage and interface with mappings loaded into the system via the ImportKeyValueMapping job step. Class can be used to retrieve values for known keys, iterate over all keys known in a mapping or list all known mappings.
 *
Mappings are read into the system using the ImportKeyValueMapping job step.

Generic mapping capability enables you to map keys to values, with the mapping stored in a high-performance data store that is independent of the database. This supports large datasets, with high performance for lookup. An example of using this feature is to map SKUs from a backend system to Commerce Cloud Digital SKUs on-the-fly in Digital script, so that interaction with the backend system is transparent and does not require adding Digital SKUs to the third party system.
 */
declare class MappingMgr {
	/**
	 * List all known mappings.
	 */
	mappingNames: Collection<string>

	protected constructor();


}


export = MappingMgr;
