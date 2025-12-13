import CustomerActiveData = require('./CustomerActiveData')
import CustomerCDPData = require('./CustomerCDPData')
import ExternalProfile = require('./ExternalProfile');
import AddressBook = require('./AddressBook')
import Collection = require('../util/Collection')
import CustomerGroup = require('./CustomerGroup')
import OrderHistory = require('./OrderHistory')
import Profile = require('./Profile')
import ProductList = require('./ProductList')

declare class RegisteredCustomer extends Customer {
	readonly profile: Profile;
	registered: true;
	addressBook: AddressBook;
}

declare class Customer {
	protected constructor()

	/**
	 * The active data for this customer.
	 */
	readonly activeData: CustomerActiveData

	/**
	 * The address book for the profile of this customer, or null if this customer has no profile, such as for an anonymous customer.
	 */
	readonly addressBook: AddressBook

	/**
	 * Identifies if the customer is anonymous. An anonymous customer is the opposite of a registered customer.
	 */
	readonly anonymous: boolean

	/**
	 * Identifies if the customer is authenticated. This method checks whether this customer is the customer associated with the session and than checks whether the session in an authenticated state. Note: The pipeline debugger will always show 'false' for this value regardless of whether the customer is authenticated or not.
	 */
	readonly authenticated: boolean

	/**
	 * The Salesforce CDP (Customer Data Platform) data for this customer.
	 */
	readonly CDPData: CustomerCDPData

	/**
	 * The customer groups this customer is member of.
	 * - Result contains static customer groups in storefront and job session
	 * - Result contains dynamic customer groups in storefront and job session. Dynamic customer groups referring session or request data are not available when processing the customer in a job session, or when this customer is not the customer assigned to the current session.
	 * - Result contains system groups 'Everyone', 'Unregistered', 'Registered' for all customers in storefront and job sessions
	 */
	readonly customerGroups: Collection<CustomerGroup>

	/**
	 * Identifies if the customer is externally authenticated. An externally authenticated customer does not have the password stored in our system but logs in through an external OAuth provider (Google, Facebook, LinkedIn, etc.)
	 */
	readonly externallyAuthenticated: boolean

	/**
	 * A collection of any external profiles the customer may have
	 */
	readonly externalProfiles: Collection<ExternalProfile>

	/**
	 * The Global Party ID for the customer, if there is one. Global Party ID is created by Customer 360 and identifies a person across multiple systems.
	 */
	readonly globalPartyID: string

	/**
	 * The unique, system generated ID of the customer.
	 */
	readonly ID: string

	/**
	 * The note for this customer, or null if this customer has no note, such as for an anonymous customer or when note has 0 length.
	 */
	readonly note: string

	/**
	 * The customer order history.
	 */
	readonly orderHistory: OrderHistory

	/**
	 * The customer profile.
	 */
	readonly profile: Profile | null

	/**
	 * Identifies if the customer is registered. A registered customer may or may not be authenticated. This method checks whether the user has a profile.
	 */
	readonly registered: boolean


}

export = Customer
