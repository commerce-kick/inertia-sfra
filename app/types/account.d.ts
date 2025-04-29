export interface TAccount {
  profile:                    Profile;
  addresses:                  Address[];
  preferredAddress:           PreferredAddress;
  orderHistory:               OrderHistory;
  payment:                    null;
  registeredUser:             boolean;
  isExternallyAuthenticated:  boolean;
  customerPaymentInstruments: any[];
}

export interface Address {
  address1:    string;
  address2:    null;
  city:        string;
  firstName:   string;
  lastName:    string;
  ID:          string;
  addressId:   string;
  phone:       string;
  postalCode:  string;
  stateCode:   null;
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

export interface OrderHistory {
  resources:            Resources;
  shippable:            boolean;
  usingMultiShipping:   boolean;
  orderNumber:          string;
  priceTotal:           string;
  creationDate:         Date;
  orderEmail:           string;
  orderStatus:          OrderStatus;
  productQuantityTotal: number;
  firstLineItem:        FirstLineItem;
  shippedToFirstName:   string;
  shippedToLastName:    string;
}

export interface FirstLineItem {
  imageURL: string;
  alt:      string;
  title:    string;
}

export interface OrderStatus {
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

export interface PreferredAddress {
  address: Address;
}

export interface Profile {
  firstName: string;
  lastName:  string;
  email:     string;
  phone:     string;
  password:  string;
}
