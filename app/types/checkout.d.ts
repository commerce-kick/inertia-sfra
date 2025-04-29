export interface TOrder {
    resources:            Resources;
    shippable:            boolean;
    usingMultiShipping:   boolean;
    orderNumber:          null;
    priceTotal:           string;
    creationDate:         Date;
    orderEmail:           string;
    orderStatus:          null;
    productQuantityTotal: number;
    totals:               Totals;
    steps:                Steps;
    items:                Items;
    billing:              Billing;
    shipping:             Shipping[];
}

export interface Billing {
    billingAddress:    BillingAddress;
    payment:           Payment;
    matchingAddressId: string;
}

export interface BillingAddress {
    address: Address;
}

export interface Address {
    address1:    string;
    address2:    null;
    city:        string;
    firstName:   string;
    lastName:    string;
    ID:          null;
    addressId:   null;
    phone:       string;
    postalCode:  string;
    stateCode:   null;
    jobTitle:    null;
    postBox:     null;
    salutation:  null;
    secondName:  null;
    companyName: null;
    suffix:      null;
    suite:       null;
    title:       null;
    countryCode: CountryCode;
}

export interface CountryCode {
    displayValue: string;
    value:        string;
}

export interface Payment {
    applicablePaymentMethods:   ApplicablePaymentMethod[];
    applicablePaymentCards:     ApplicablePaymentCard[];
    selectedPaymentInstruments: any[];
}

export interface ApplicablePaymentCard {
    cardType: string;
    name:     string;
}

export interface ApplicablePaymentMethod {
    ID:   string;
    name: string;
}

export interface Items {
    items:         Item[];
    totalQuantity: number;
}

export interface Item {
    uuid:                     string;
    id:                       string;
    productName:              string;
    productType:              string;
    brand:                    null;
    price:                    Price;
    renderedPrice:            string;
    images:                   Images;
    variationAttributes:      VariationAttribute[];
    availability:             Availability;
    available:                boolean;
    quantity:                 number;
    isGift:                   boolean;
    renderedPromotions:       string;
    UUID:                     string;
    isOrderable:              boolean;
    shipmentUUID:             string;
    isBonusProductLineItem:   boolean;
    priceTotal:               PriceTotal;
    quantityOptions:          QuantityOptions;
    options:                  any[];
    bonusProductLineItemUUID: null;
    preOrderUUID:             null;
    discountLineItems:        any[];
    bonusProducts:            null;
}

export interface Availability {
    messages:    string[];
    inStockDate: null;
}

export interface Images {
    small: Small[];
}

export interface Small {
    alt:    string;
    url:    string;
    title:  string;
    index:  string;
    absURL: string;
}

export interface Price {
    sales: List;
    list:  List;
}

export interface List {
    value:        number;
    currency:     string;
    formatted:    string;
    decimalPrice: string;
}

export interface PriceTotal {
    price:         string;
    renderedPrice: string;
}

export interface QuantityOptions {
    minOrderQuantity: number;
    maxOrderQuantity: number;
}

export interface VariationAttribute {
    displayName:  string;
    displayValue: string;
    attributeId:  string;
    id:           string;
}

export interface Resources {
    noSelectedPaymentMethod: string;
    cardType:                string;
    cardEnding:              string;
    shippingMethod:          string;
    items:                   string;
    item:                    string;
    addNewAddress:           string;
    newAddress:              string;
    shipToAddress:           string;
    shippingAddresses:       string;
    accountAddresses:        string;
    shippingTo:              string;
    shippingAddress:         string;
    addressIncomplete:       string;
    giftMessage:             string;
}

export interface Shipping {
    UUID:                      string;
    productLineItems:          Items;
    applicableShippingMethods: ShippingMethod[];
    selectedShippingMethod:    ShippingMethod;
    shippingAddress:           Address;
    isGift:                    boolean;
    giftMessage:               null;
}

export interface ShippingMethod {
    ID:                   string;
    displayName:          string;
    description:          string;
    estimatedArrivalTime: string;
    default:              boolean;
    shippingCost:         string;
    selected:             boolean;
}

export interface Steps {
    shipping: Ing;
    billing:  Ing;
}

export interface Ing {
    iscompleted: boolean;
}

export interface Totals {
    subTotal:                   string;
    totalShippingCost:          string;
    grandTotal:                 string;
    totalTax:                   string;
    orderLevelDiscountTotal:    LevelDiscountTotal;
    shippingLevelDiscountTotal: LevelDiscountTotal;
    discounts:                  any[];
    discountsHtml:              string;
}

export interface LevelDiscountTotal {
    value:     number;
    formatted: string;
}
