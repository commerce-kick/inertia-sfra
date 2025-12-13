import ExtensibleObject = require('../object/ExtensibleObject');
import Money = require('../value/Money');
import Collection = require('../util/Collection');
import LineItem = require('./LineItem');
import ProductLineItem = require('./ProductLineItem');
import HashMap = require('../util/HashMap');
import Quantity = require('../value/Quantity');
import PriceAdjustment = require('./PriceAdjustment');
import OrderAddress = require('./OrderAddress');
import BonusDiscountLineItem = require('./BonusDiscountLineItem');
import EnumValue = require('../value/EnumValue');
import CouponLineItem = require('./CouponLineItem');
import Customer = require('../customer/Customer');
import Shipment = require('./Shipment');
import GiftCertificateLineItem = require('./GiftCertificateLineItem');
import List = require('../util/List');
import Note = require('../object/Note');
import Status = require('../system/Status');
import Product = require('../catalog/Product');
import ProductOptionModel = require('../catalog/ProductOptionModel');
import OrderPaymentInstrument = require('./OrderPaymentInstrument');
import ProductListItem = require('../customer/ProductListItem');
import Discount = require('../campaign/Discount');
import CustomAttributes = require('../object/CustomAttributes');

type LineItemCtnrChannelTypes = {
    [K in keyof typeof LineItemCtnr as K extends `CHANNEL_TYPE_${string}` ? K : never]: typeof LineItemCtnr[K];
} extends { [key: string]: infer V } ? V : never;


declare class LineItemCtnr<T extends CustomAttributes> extends ExtensibleObject<T> {
	/**
	 * constant for Business Type B2B
	 */
	static readonly BUSINESS_TYPE_B2B = 2;
	/**
	 * constant for Business Type B2C
	 */
	static readonly BUSINESS_TYPE_B2C = 1;
	/**
	 * constant for Channel Type CallCenter
	 */
	static readonly CHANNEL_TYPE_CALLCENTER = 2;
	/**
	 * constant for Channel Type Customer Service Center
	 */
	static readonly CHANNEL_TYPE_CUSTOMERSERVICECENTER = 11;
	/**
	 * constant for Channel Type DSS
	 */
	static readonly CHANNEL_TYPE_DSS = 4;
	/**
	 * constant for Channel Type Facebook Ads
	 */
	static readonly CHANNEL_TYPE_FACEBOOKADS = 8;
	/**
	 * constant for Channel Type Google
	 */
	static readonly CHANNEL_TYPE_GOOGLE = 13;
	/**
	 * constant for Channel Type Instagram Commerce
	 */
	static readonly CHANNEL_TYPE_INSTAGRAMCOMMERCE = 12;
	/**
	 * constant for Channel Type Marketplace
	 */
	static readonly CHANNEL_TYPE_MARKETPLACE = 3;
	/**
	 * constant for Channel Type Online Reservation
	 */
	static readonly CHANNEL_TYPE_ONLINERESERVATION = 10;
	/**
	 * constant for Channel Type Pinterest
	 */
	static readonly CHANNEL_TYPE_PINTEREST = 6;
	/**
	 * constant for Channel Type Snapchat
	 */
	static readonly CHANNEL_TYPE_SNAPCHAT = 15;
	/**
	 * constant for Channel Type Store
	 */
	static readonly CHANNEL_TYPE_STORE = 5;
	/**
	 * constant for Channel Type Storefront
	 */
	static readonly CHANNEL_TYPE_STOREFRONT = 1;
	/**
	 * constant for Channel Type Subscriptions
	 */
	static readonly CHANNEL_TYPE_SUBSCRIPTIONS = 9;
	/**
	 * constant for Channel Type TikTok
	 */
	static readonly CHANNEL_TYPE_TIKTOK = 14;
	/**
	 * constant for Channel Type Twitter
	 */
	static readonly CHANNEL_TYPE_TWITTER = 7;
	/**
	 * constant for Channel Type WhatsApp
	 */
	static readonly CHANNEL_TYPE_WHATSAPP = 16;
	/**
	 * constant for Channel Type YouTube
	 */
	static readonly CHANNEL_TYPE_YOUTUBE = 17;

	/**
	 * The adjusted total gross price (including tax) in purchase currency. Adjusted merchandize prices represent the sum of product prices before services such as shipping, but after product-level and order-level adjustments.
	 */
	readonly adjustedMerchandizeTotalGrossPrice: Money;

	/**
	 * The total net price (excluding tax) in purchase currency. Adjusted merchandize prices represent the sum of product prices before services such as shipping, but after product-level and order-level adjustments.
	 */
	readonly adjustedMerchandizeTotalNetPrice: Money;

	/**
	 * The adjusted merchandize total price including product-level and order-level adjustments. If the line item container is based on net pricing the adjusted merchandize total net price is returned. If the line item container is based on gross pricing the adjusted merchandize total gross price is returned.
	 */
	readonly adjustedMerchandizeTotalPrice: Money;

	/**
	 * The subtotal tax in purchase currency. Adjusted merchandize prices represent the sum of product prices before services such as shipping have been added, but after adjustment from promotions have been added.
	 */
	readonly adjustedMerchandizeTotalTax: Money;


	/**
	 * The adjusted sum of all shipping line items of the line item container, including tax after shipping adjustments have been applied.
	 */
	readonly adjustedShippingTotalGrossPrice: Money;

	/**
	 * The sum of all shipping line items of the line item container, excluding tax after shipping adjustments have been applied.
	 */
	readonly adjustedShippingTotalNetPrice: Money;

	/**
	 * The adjusted shipping total price. If the line item container is based on net pricing the adjusted shipping total net price is returned. If the line item container is based on gross pricing the adjusted shipping total gross price is returned.
	 */
	readonly adjustedShippingTotalPrice: Money;

	/**
	 * The tax of all shipping line items of the line item container after shipping adjustments have been applied.
	 */
	readonly adjustedShippingTotalTax: Money;

	/**
	 * All product, shipping, price adjustment, and gift certificate line items of the line item container.
	 */
	readonly allLineItems: Collection<LineItem<any>>

	/**
	 * All product line items of the container, no matter if they are dependent or independent. This includes option, bundled and bonus line items.
	 */
	readonly allProductLineItems: Collection<ProductLineItem>;

	/**
	 * A hash mapping all products in the line item container to their total quantities. The total product quantity is used chiefly to validate the availability of the items in the cart. This method is not appropriate to look up prices because it returns products such as bundled line items which are included in the price of their parent and therefore have no corresponding price.
	 *
	 * The method counts all direct product line items, plus dependent product line items that are not option line items. It also excludes product line items that are not associated to any catalog product.
	 */
	readonly allProductQuantities: HashMap<Product, Quantity>;


	/**
	 * The collection of all shipping price adjustments applied somewhere in the container. This can be adjustments applied to individual shipments or to the container itself. Note that the promotions engine only applies shipping price adjustments to the the default shipping line item of shipments, and never to the container.
	 */
	readonly allShippingPriceAdjustments: Collection<PriceAdjustment>;

	/**
	 * The billing address defined for the container. Returns null if no billing address has been created yet.
	 */
	readonly billingAddress: OrderAddress | null;

	/**
	 * An unsorted collection of the the bonus discount line items associated with this container.
	 */
	readonly bonusDiscountLineItems: Collection<BonusDiscountLineItem>;

	/**
	 * The collection of product line items that are bonus items (where ProductLineItem.isBonusProductLineItem() is true).
	 */
	readonly bonusLineItems: Collection<ProductLineItem>;

	/**
	 * The type of the business this order has been placed in.
	 Possible values are BUSINESS_TYPE_B2C or BUSINESS_TYPE_B2B.
	 */
	readonly businessType: EnumValue<number>;

	/**
	 * The channel type defines in which sales channel this order has been created. This can be used to distinguish order placed through Storefront, Call Center or Marketplace.
	 Possible values are CHANNEL_TYPE_STOREFRONT, CHANNEL_TYPE_CALLCENTER, CHANNEL_TYPE_MARKETPLACE, CHANNEL_TYPE_DSS, CHANNEL_TYPE_STORE, CHANNEL_TYPE_PINTEREST, CHANNEL_TYPE_TWITTER, CHANNEL_TYPE_FACEBOOKADS, CHANNEL_TYPE_SUBSCRIPTIONS or CHANNEL_TYPE_ONLINERESERVATION.
	 */
	readonly channelType: EnumValue<LineItemCtnrChannelTypes> | null;

	/**
	 * A sorted collection of the coupon line items in the container. The coupon line items are returned in the order they were added to container.
	 */
	readonly couponLineItems: Collection<CouponLineItem>;

	/**
	 * The currency code for this line item container. The currency code is a 3-character currency mnemonic such as 'USD' or 'EUR'. The currency code represents the currency in which the calculation is made, and in which the buyer sees all prices in the store front.
	 */
	readonly currencyCode: string;

	/**
	 * The customer associated with this container.
	 */
	readonly customer: Customer;

	/**
	 * The email of the customer associated with this container.
	 */
	readonly customerEmail: string;

	/**
	 * The name of the customer associated with this container.
	 */
	readonly customerName: string;

	/**
	 * The customer number of the customer associated with this container.
	 */
	readonly customerNo: string;

	/**
	 * The default shipment of the line item container.
	 */
	readonly defaultShipment: Shipment;

	/**
	 * The Etag of the line item container. The Etag is a hash that represents the overall container state including any associated objects like line items.
	 */
	readonly etag: string;

	/**
	 * All gift certificate line items of the container.
	 */
	readonly giftCertificateLineItems: Collection<GiftCertificateLineItem>;

	/**
	 * An unsorted collection of the PaymentInstrument instances that represent GiftCertificates in this container.
	 */
	readonly giftCertificatePaymentInstruments: Collection<OrderPaymentInstrument>;

	/**
	 * The total gross price of all gift certificates in the cart. Should usually be equal to total net price.
	 */
	readonly giftCertificateTotalGrossPrice: Money;

	/**
	 * The total net price (excluding tax) of all gift certificates in the cart. Should usually be equal to total gross price.
	 */
	readonly giftCertificateTotalNetPrice: Money;

	/**
	 * The gift certificate total price. If the line item container is based on net pricing the gift certificate total net price is returned. If the line item container is based on gross pricing the gift certificate total gross price is returned.
	 */
	readonly giftCertificateTotalPrice: Money;

	/**
	 * The total tax of all gift certificates in the cart. Should usually be 0.0.
	 */
	readonly giftCertificateTotalTax: Money;

	/**
	 * The total gross price (including tax) in purchase currency. Merchandize total prices represent the sum of product prices before services such as shipping or adjustment from promotions have been added.
	 */
	readonly merchandizeTotalGrossPrice: Money;

	/**
	 * The total net price (excluding tax) in purchase currency. Merchandize total prices represent the sum of product prices before services such as shipping or adjustment from promotion have been added.
	 */
	readonly merchandizeTotalNetPrice: Money;

	/**
	 * The merchandize total price. If the line item container is based on net pricing the merchandize total net price is returned. If the line item container is based on gross pricing the merchandize total gross price is returned.
	 */
	readonly merchandizeTotalPrice: Money;

	/**
	 * The total tax in purchase currency. Merchandize total prices represent the sum of product prices before services such as shipping or adjustment from promotions have been added.
	 */
	readonly merchandizeTotalTax: Money;

	/**
	 * The list of notes for this object, ordered by creation time from oldest to newest.
	 */
	readonly notes: List<Note>;

	/**
	 * An unsorted collection of the payment instruments in this container.
	 */
	readonly paymentInstruments: Collection<OrderPaymentInstrument>;

	/**
	 * The collection of price adjustments that have been applied to the totals such as promotion on the purchase value (i.e. $10 Off or 10% Off). The price adjustments are sorted by the order in which they were applied to the order by the promotions engine.
	 */
	readonly priceAdjustments: Collection<PriceAdjustment>;

	/**
	 * The product line items of the container that are not dependent on other product line items. This includes line items representing bonus products in the container but excludes option, bundled, and bonus line items. The returned collection is sorted by the position attribute of the product line items.
	 */
	readonly productLineItems: Collection<ProductLineItem>;

	/**
	 * A hash map of all products in the line item container and their total quantities. The total product quantity is for example used to lookup the product price.

	 The method counts all direct product line items, plus dependent product line items that are not bundled line items and no option line items. It also excludes product line items that are not associated to any catalog product, and bonus product line items.
	 */
	readonly productQuantities: HashMap<Product, Quantity>;

	/**
	 * The total quantity of all product line items. Not included are bundled line items and option line items.
	 */
	readonly productQuantityTotal;

	/**
	 * All shipments of the line item container.
	 The first shipment in the returned collection is the default shipment. All other shipments are sorted ascending by shipment ID.
	 */
	readonly shipments: Collection<Shipment>;

	/**
	 * The of shipping price adjustments applied to the shipping total of the container. Note that the promotions engine only applies shipping price adjustments to the the default shipping line item of shipments, and never to the container.
	 */
	readonly shippingPriceAdjustments: Collection<PriceAdjustment>;

	/**
	 * The sum of all shipping line items of the line item container, including tax before shipping adjustments have been applied.
	 */
	readonly shippingTotalGrossPrice: Money;

	/**
	 * The sum of all shipping line items of the line item container, excluding tax before shipping adjustments have been applied.
	 */
	readonly shippingTotalNetPrice: Money;

	/**
	 * The shipping total price. If the line item container is based on net pricing the shipping total net price is returned. If the line item container is based on gross pricing the shipping total gross price is returned.
	 */
	readonly shippingTotalPrice: Money;

	/**
	 * The tax of all shipping line items of the line item container before shipping adjustments have been applied.
	 */
	readonly shippingTotalTax: Money;

	/**
	 * The grand total price gross of tax for LineItemCtnr, in purchase currency. Total prices represent the sum of product prices, services prices and adjustments.
	 */
	readonly totalGrossPrice: Money;

	/**
	 * The grand total price for LineItemCtnr net of tax, in purchase currency. Total prices represent the sum of product prices, services prices and adjustments.
	 */
	readonly totalNetPrice: Money;
	/**
	 * The grand total tax for LineItemCtnr, in purchase currency. Total prices represent the sum of product prices, services prices and adjustments.
	 */
	readonly totalTax: Money;


}


export = LineItemCtnr;
