import EncryptedObject = require('../customer/EncryptedObject');

import CustomAttributes = require('../object/CustomAttributes');


declare class PaymentInstrument<T extends CustomAttributes> extends EncryptedObject<T> {

	/**
	 * The outdated encryption algorithm "RSA/ECB/PKCS1Padding". Please do not use anymore!
	 *
	 * Deprecated:
	Support for this algorithm will be removed in a future release. Please use ENCRYPTION_ALGORITHM_RSA_ECB_OAEPWITHSHA56ANDMGF1PADDING instead.
	 * @deprecated
	 */
	static readonly ENCRYPTION_ALGORITHM_RSA = "RSA"


	/**
	 * The encryption algorithm "RSA/ECB/OAEPWithSHA-256AndMGF1Padding".
	 */
	static readonly ENCRYPTION_ALGORITHM_RSA_ECB_OAEPWITHSHA_256ANDMGF1PADDING: "RSA/ECB/OAEPWithSHA-256AndMGF1Padding"

	/**
	 * Represents a bank transfer type of payment.
	 */
	static readonly METHOD_BANK_TRANSFER = "BANK_TRANSFER"

	/**
	 * Represents a 'bill me later' type of payment.
	 */
	static readonly METHOD_BML = "BML"

	/**
	 * Represents a credit card type of payment.
	 */
	static readonly METHOD_CREDIT_CARD = "CREDIT_CARD"

	/**
	 * Represents an Android Pay payment.
	 */
	static readonly METHOD_DW_ANDROID_PAY = "DW_ANDROID_PAY"

	/**
	 * Represents an Apple Pay payment.
	 */
	static readonly METHOD_DW_APPLE_PAY = "DW_APPLE_PAY"

	/**
	 * Represents a gift certificate.
	 */
	static readonly METHOD_GIFT_CERTIFICATE = "GIFT_CERTIFICATE"


    bankAccountDriversLicense  :  string;
    bankAccountDriversLicenseStateCode  :  string;
    bankAccountHolder  :  string;
    bankAccountNumber  :  string;
    bankAccountNumberLastDigits  :  string;
    bankRoutingNumber  :  string;
    creditCardExpirationMonth  :  number;
    creditCardExpirationYear  :  number;
    creditCardExpired  :  boolean;
    creditCardHolder  :  string;
    creditCardIssueNumber  :  string;
    creditCardNumber  :  string;
    creditCardNumberLastDigits  :  string;
    creditCardToken  :  string;
    creditCardType  :  string;
    creditCardValidFromMonth  :  number;
    creditCardValidFromYear  :  number;
    giftCertificateCode  :  string | null;
    maskedBankAccountDriversLicense  :  string;
    maskedBankAccountNumber  :  string;
    maskedCreditCardNumber  :  string;
    maskedGiftCertificateCode  :  string;
    paymentMethod  :  string;
    permanentlyMasked  :  boolean;

}

export = PaymentInstrument;
