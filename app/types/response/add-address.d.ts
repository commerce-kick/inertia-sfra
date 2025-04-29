export interface AddAddressProps {
    currentCustomer:  CurrentCustomer;
    staticUrl:        string;
    navBar:           NavBar;
    locale:           string;
    action:           string;
    queryString:      string;
    csrf:             CSRF;
    tracking_consent: null;
    addressForm:      AddressForm;
    breadcrumbs:      Breadcrumb[];
}

export interface AddressForm {
    valid:           boolean;
    htmlName:        string;
    dynamicHtmlName: string;
    error:           null;
    attributes:      string;
    formType:        string;
    addressId:       Address1;
    firstName:       Address1;
    lastName:        Address1;
    address1:        Address1;
    address2:        Address2;
    city:            Address1;
    postalCode:      Address1;
    country:         Address1;
    states:          States;
    phone:           Address1;
    apply:           Apply;
    remove:          Apply;
    base:            Base;
}

export interface Address1 {
    htmlValue:       string;
    mandatory:       boolean;
    dynamicHtmlName: string;
    htmlName:        string;
    valid:           boolean;
    label:           string;
    maxLength:       number;
    minLength:       number;
    regEx:           null | string;
    formType:        string;
    options?:        Option[];
    selectedOption?: string;
    description?:    string;
}

export interface Option {
    checked:   boolean;
    htmlValue: string;
    label:     string;
    id:        string;
    selected:  boolean;
    value:     null | string;
}

export interface Address2 {
    htmlValue:       string;
    mandatory:       string;
    dynamicHtmlName: string;
    htmlName:        string;
    valid:           boolean;
    label:           string;
    maxLength:       number;
    minLength:       number;
    regEx:           null;
    formType:        string;
}

export interface Apply {
    description: null;
    label:       null;
    submitted:   boolean;
    triggered:   boolean;
    formType:    string;
}

export interface Base {
}

export interface States {
    valid:           boolean;
    htmlName:        string;
    dynamicHtmlName: string;
    error:           null;
    attributes:      string;
    formType:        string;
    stateCode:       Address1;
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
    raw:         Base;
    profile:     Profile;
    addressBook: AddressBook;
    wallet:      Wallet;
}

export interface AddressBook {
    preferredAddress: Address;
    addresses:        Address[];
}

export interface Address {
    address1:    string;
    address2:    null;
    city:        string;
    companyName: null;
    countryCode: CountryCode;
    firstName:   string;
    lastName:    string;
    ID:          string;
    phone:       string;
    postalCode:  string;
    stateCode:   null;
    postBox:     null;
    salutation:  null;
    secondName:  null;
    suffix:      null;
    suite:       null;
    title:       null;
    raw:         Base;
}

export interface CountryCode {
    displayValue: string;
    value:        string;
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
    raw:                       Base;
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
