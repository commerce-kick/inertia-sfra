import Collection = require('../util/Collection')
import ABTestSegment = require('./ABTestSegment')
/**
 * Manager class used to access AB-test information in the storefront.
 */
declare class ABTestMgr {
	protected constructor()

	/**
	 * Return the AB-test segments to which the current customer is assigned. AB-test segments deleted in the meantime will not be returned.
	 */
	readonly assignedTestSegments  :  Collection<ABTestSegment>


}

export = ABTestMgr
