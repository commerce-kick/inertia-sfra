export interface MiniCartResponse {
    action:               string;
    queryString:          string;
    locale:               string;
    reportingURLs:        ReportingURL[];
    hasBonusProduct:      boolean;
    actionUrls:           ActionUrls;
    numOfShipments:       number;
    totals:               Totals;
    shipments:            Shipment[];
    approachingDiscounts: any[];
    items:                Item[];
    numItems:             number;
    valid:                Valid;
    resources:            Resources;
    checkoutUrl:          string;
}

export interface ActionUrls {
    removeProductLineItemUrl: string;
    updateQuantityUrl:        string;
    selectShippingUrl:        string;
    submitCouponCodeUrl:      string;
    removeCouponLineItem:     string;
}

export interface Item {
    uuid:                     string;
    id:                       string;
    productName:              string;
    productType:              string;
    brand:                    null | string;
    price:                    Price;
    renderedPrice:            string;
    images:                   Images;
    variationAttributes:      VariationAttribute[] | null;
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
    options:                  Option[];
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

export interface Option {
    displayName:     string;
    optionId:        string;
    selectedValueId: string;
}

export interface Price {
    sales: Sales;
    list:  Sales | null;
}

export interface Sales {
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
    displayName:  DisplayName;
    displayValue: string;
    attributeId:  AttributeID;
    id:           AttributeID;
}

export enum AttributeID {
    Color = "color",
    Size = "size",
}

export enum DisplayName {
    Color = "Color",
    Size = "Size",
}

export interface ReportingURL {
}

export interface Resources {
    numberOfItems:        string;
    minicartCountOfItems: string;
    emptyCartMsg:         string;
}

export interface Shipment {
    shippingMethods:        ShippingMethod[];
    selectedShippingMethod: string;
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

export interface Valid {
    error:   boolean;
    message: null;
}
