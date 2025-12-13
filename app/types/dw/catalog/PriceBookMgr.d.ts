import Collection = require("../util/Collection");
import PriceBook = require("./PriceBook")

/**
 * Price book manager provides methods to access price books.
 */
declare class PriceBookMgr {
	protected constructor();
	/**
	 * All price books defined for the organization.
	 */
	static readonly allPriceBooks: Collection<PriceBook>

	/**
	 * A collection of price books that are set in the user session.
	 */
	static applicablePriceBooks: Collection<PriceBook>


	/**
	 * All price books assigned to the current site.
Please note that this doesn't include parent price books not assigned to the site, but considered by the price lookup.
	 */
	static readonly sitePriceBooks: Collection<PriceBook>


}

export = PriceBookMgr;
