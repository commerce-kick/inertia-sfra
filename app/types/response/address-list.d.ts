export interface AddressListProps {
    currentCustomer:  CurrentCustomer;
    staticUrl:        string;
    navBar:           NavBar;
    locale:           string;
    action:           string;
    queryString:      string;
    tracking_consent: null;
    csrf:             CSRF;
    addressBook:      AddressBookElement[];
    actionUrls:       ActionUrls;
    breadcrumbs:      Breadcrumb[];
}

export interface ActionUrls {
    deleteActionUrl: string;
    listActionUrl:   string;
}

export interface AddressBookElement {
    address: Address;
}

export interface Address {
    address1:    string;
    address2:    null;
    city:        string;
    firstName:   string;
    lastName:    string;
    ID:          string;
    addressId?:  string;
    phone:       string;
    postalCode:  string;
    stateCode:   null | string;
    jobTitle?:   null;
    postBox:     null;
    salutation:  null;
    secondName:  null;
    companyName: null;
    suffix:      null;
    suite:       null;
    title:       null;
    countryCode: CountryCode;
    UUID?:       string;
    raw?:        Raw;
}

export interface CountryCode {
    displayValue: string;
    value:        string;
}

export interface Raw {
}

export interface Breadcrumb {
    htmlValue: string;
    url:       string;
}

export interface CSRF {
    tokenName: string;
    token:     string;
}

export interface CurrentCustomer {
    raw:         Raw;
    profile:     Profile;
    addressBook: CurrentCustomerAddressBook;
    wallet:      Wallet;
}

export interface CurrentCustomerAddressBook {
    preferredAddress: Address;
    addresses:        Address[];
}

export interface Profile {
    lastName:   string;
    firstName:  string;
    email:      string;
    phone:      string;
    customerNo: string;
}

export interface Wallet {
    paymentInstruments: PaymentInstrument[];
}

export interface PaymentInstrument {
    creditCardHolder:          string;
    maskedCreditCardNumber:    string;
    creditCardType:            string;
    creditCardExpirationMonth: number;
    creditCardExpirationYear:  number;
    UUID:                      string;
    creditCardNumber:          string;
    raw:                       Raw;
}

export interface NavBar {
    categories: Category[];
}

export interface Category {
    name:                  string;
    url:                   string;
    id:                    string;
    subCategories?:        CategorySubCategory[];
    complexSubCategories?: boolean;
}

export interface CategorySubCategory {
    name:                  string;
    url:                   string;
    id:                    string;
    subCategories?:        SubCategorySubCategory[];
    complexSubCategories?: boolean;
}

export interface SubCategorySubCategory {
    name: string;
    url:  string;
    id:   string;
}
