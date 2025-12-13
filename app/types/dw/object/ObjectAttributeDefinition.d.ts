import Collection = require('../util/Collection');
import ObjectTypeDefinition = require('./ObjectTypeDefinition');
import ObjectAttributeValueDefinition = require('./ObjectAttributeValueDefinition');
import ObjectAttributeGroup = require('./ObjectAttributeGroup');

declare class ObjectAttributeDefinition {
	/**
	 * Boolean value type.
	 */
	readonly VALUE_TYPE_BOOLEAN: 8

	/**
	 * Date value type.
	 */
	readonly VALUE_TYPE_DATE: 6

	/**
	 * Date and Time value type.
	 */
	readonly VALUE_TYPE_DATETIME: 11

	/**
	 * Email value type.
	 */
	readonly VALUE_TYPE_EMAIL: 12

	/**
	 * Enum of int value type.
	 */
	readonly VALUE_TYPE_ENUM_OF_INT: 31

	/**
	 * Enum of String value type.
	 */
	readonly VALUE_TYPE_ENUM_OF_STRING: 33

	/**
	 * HTML value type.
	 */
	readonly VALUE_TYPE_HTML: 5

	/**
	 * Image value type.
	 */
	readonly VALUE_TYPE_IMAGE: 7


	/**
	 * int value type.
	 */
	readonly VALUE_TYPE_INT: 1

	/**
	 * Money value type.
	 */
	readonly VALUE_TYPE_MONEY: 9

	/**
	 * Number value type.
	 */
	readonly VALUE_TYPE_NUMBER: 2

	/**
	 * Password value type.
	 */
	readonly VALUE_TYPE_PASSWORD: 13

	/**
	 * Quantity value type.
	 */
	readonly VALUE_TYPE_QUANTITY: 10

	/**
	 * Set of int value type.
	 */
	readonly VALUE_TYPE_SET_OF_INT: 21

	/**
	 * Set of Number value type.
	 */
	readonly VALUE_TYPE_SET_OF_NUMBER: 22

	/**
	 * Set of String value type.
	 */
	readonly VALUE_TYPE_SET_OF_STRING: 23

	/**
	 * String value type.
	 */
	readonly VALUE_TYPE_STRING: 3

	/**
	 * Text value type.
	 */
	readonly VALUE_TYPE_TEXT: 4


	valueTypeCode: number;
	values: Collection<ObjectAttributeValueDefinition>;
	unit: string;
	system: boolean;
	objectTypeDefinition: ObjectTypeDefinition;
	multiValueType: boolean;
	mandatory: boolean;
	key: boolean;
	ID: string;
	displayName: string;
	defaultValue: ObjectAttributeValueDefinition;
	attributeGroups: Collection<ObjectAttributeGroup>

	private constructor();


	/**
	 * Boolean value type.
	 */
	static readonly VALUE_TYPE_BOOLEAN: 8

	/**
	 * Date value type.
	 */
	static readonly VALUE_TYPE_DATE: 6

	/**
	 * Date and Time value type.
	 */
	static readonly VALUE_TYPE_DATETIME: 11

	/**
	 * Email value type.
	 */
	static readonly VALUE_TYPE_EMAIL: 12

	/**
	 * Enum of int value type.
	 */
	static readonly VALUE_TYPE_ENUM_OF_INT: 31

	/**
	 * Enum of String value type.
	 */
	static readonly VALUE_TYPE_ENUM_OF_STRING: 33

	/**
	 * HTML value type.
	 */
	static readonly VALUE_TYPE_HTML: 5

	/**
	 * Image value type.
	 */
	static readonly VALUE_TYPE_IMAGE: 7


	/**
	 * int value type.
	 */
	static readonly VALUE_TYPE_INT: 1

	/**
	 * Money value type.
	 */
	static readonly VALUE_TYPE_MONEY: 9

	/**
	 * Number value type.
	 */
	static readonly VALUE_TYPE_NUMBER: 2

	/**
	 * Password value type.
	 */
	static readonly VALUE_TYPE_PASSWORD: 13

	/**
	 * Quantity value type.
	 */
	static readonly VALUE_TYPE_QUANTITY: 10

	/**
	 * Set of int value type.
	 */
	static readonly VALUE_TYPE_SET_OF_INT: 21

	/**
	 * Set of Number value type.
	 */
	static readonly VALUE_TYPE_SET_OF_NUMBER: 22

	/**
	 * Set of String value type.
	 */
	static readonly VALUE_TYPE_SET_OF_STRING: 23

	/**
	 * String value type.
	 */
	static readonly VALUE_TYPE_STRING: 3

	/**
	 * Text value type.
	 */
	static readonly VALUE_TYPE_TEXT: 4

}

export = ObjectAttributeDefinition;


