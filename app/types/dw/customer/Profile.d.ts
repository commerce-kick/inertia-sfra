import EncryptedObject = require('./EncryptedObject');
import AddressBook = require('./AddressBook');
import Credentials = require('./Credentials');
import EnumValue = require('../value/EnumValue');
import Wallet = require('./Wallet');
import Customer = require('./Customer')
import CustomAttributes = require('../object/CustomAttributes');


declare global {
	module ICustomAttributes {
		interface Profile extends CustomAttributes {
		}
	}
}


declare class Profile extends EncryptedObject<ICustomAttributes.Profile> {
	/**
	 * The customer's address book.
	 */
	readonly addressBook: AddressBook;

	/**
	 * The customer's birthday as a date.
	 */
	birthday: Date | null;

	/**
	 * The customer's company name.
	 */
	companyName: string;

	/**
	 * The customer's credentials.
	 */
	readonly credentials: Credentials;

	/**
	 * The customer object related to this profile.
	 */
	readonly customer: Customer;

	/**
	 * The customer's number, which is a number used to identify the Customer.
	 */
	readonly customerNo: string;

	/**
	 * The customer's email address.
	 */
	email: string;

	/**
	 * The fax number to use for the customer. The length is restricted to 32 characters.
	 */
	fax: string;

	/**
	 * Indicates that the customer is female when set to true.
	 */
	readonly female: boolean;

	/**
	 * The customer's first name.
	 */
	firstName: string;

	/**
	 * The customer's gender.
	 */
	gender: EnumValue<number> | null;

	/**
	 * The customer's job title.
	 */
	jobTitle: string;

	/**
	 * The last login time of the customer.
	 */
	readonly lastLoginTime: Date | null;

	/**
	 * The customer's last name.
	 */
	lastName: string;

	/**
	 * The last visit time of the customer.
	 */
	readonly lastVisitTime: Date | null;

	/**
	 * Indicates that the customer is male when set to true.
	 */
	readonly male: boolean;

	/**
	 * The upcoming customer's birthday as a date. If the customer already had birthday this year the method returns the birthday of the next year. Otherwise its birthday in this year. If the customer has not set a birthday this method returns null.
	 */
	readonly nextBirthday: Date | null;

	/**
	 * The business phone number to use for the customer.
	 */
	phoneBusiness: string;

	/**
	 * The phone number to use for the customer.
	 */
	phoneHome: string;

	/**
	 * The mobile phone number to use for the customer.
	 */
	phoneMobile: string;

	/**
	 * The customer's preferred locale.
	 */
	preferredLocale: string;

	/**
	 * The time the customer logged in prior to the current login.
	 */
	readonly previousLoginTime: Date | null;

	/**
	 * The time the customer visited the store prior to the current visit.
	 */
	readonly previousVisitTime: Date | null;

	/**
	 * The salutation to use for the customer.
	 */
	salutation: string;

	/**
	 * The customer's second name.
	 */
	secondName: string;

	/**
	 * The customer's suffix, such as "Jr." or "Sr.".
	 */
	suffix: string;

	/**
	 * The tax ID value. The value is returned either plain text if the current context allows plain text access, or if it's not allowed, the ID value will be returned masked.
	 */
	taxID: string;

	/**
	 * The masked value of the tax ID.
	 */
	readonly taxIDMasked: string;

	/**
	 * The tax ID type.
	 */
	taxIDType: EnumValue<string> | null;

	/**
	 * The customer's title, such as "Mrs" or "Mr".
	 */
	title: string;

	/**
	 * The wallet of this customer.
	 */
	readonly wallet: Wallet;


}

export = Profile;
