export interface AddPaymentProps {
    currentCustomer:  CurrentCustomer;
    staticUrl:        string;
    navBar:           NavBar;
    locale:           string;
    action:           string;
    queryString:      string;
    csrf:             CSRF;
    tracking_consent: null;
    paymentForm:      PaymentForm;
    expirationYears:  string[];
    breadcrumbs:      Breadcrumb[];
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
    raw:         Raw;
}

export interface CountryCode {
    displayValue: string;
    value:        string;
}

export interface Raw {
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

export interface PaymentForm {
    valid:           boolean;
    htmlName:        string;
    dynamicHtmlName: string;
    error:           null;
    attributes:      string;
    formType:        string;
    editNumber:      EditNumber;
    paymentMethod:   CardNumber;
    cardType:        CardNumber;
    cardNumber:      CardNumber;
    cardOwner:       CardNumber;
    expirationMonth: Expiration;
    expirationYear:  Expiration;
    securityCode:    CardNumber;
    saveCard:        SaveCard;
    base:            Raw;
}

export interface CardNumber {
    htmlValue:       string;
    mandatory:       boolean;
    dynamicHtmlName: string;
    htmlName:        string;
    valid:           boolean;
    label?:          string;
    maxLength:       number;
    minLength:       number;
    regEx:           null;
    formType:        string;
}

export interface EditNumber {
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

export interface Expiration {
    htmlValue:       string;
    mandatory:       boolean;
    dynamicHtmlName: string;
    htmlName:        string;
    valid:           boolean;
    label:           string;
    options:         Option[];
    selectedOption:  string;
    maxValue:        null;
    minValue:        null;
    formType:        string;
}

export interface Option {
    checked:   boolean;
    htmlValue: string;
    label:     string;
    id:        string;
    selected:  boolean;
    value:     number | null;
}

export interface SaveCard {
    htmlValue:       string;
    mandatory:       string;
    dynamicHtmlName: string;
    htmlName:        string;
    valid:           boolean;
    label:           string;
    checked:         boolean;
    selected:        boolean;
    formType:        string;
}
