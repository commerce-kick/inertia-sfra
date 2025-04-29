export interface CartProps {
    currentCustomer:  CurrentCustomer;
    staticUrl:        string;
    navBar:           NavBar;
    action:           string;
    queryString:      string;
    locale:           string;
    tracking_consent: boolean;
    csrf:             CSRF;
    items:            any[];
    numItems:         number;
    resources:        Resources;
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
    paymentInstruments: any[];
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

export interface Resources {
    numberOfItems:        string;
    minicartCountOfItems: string;
    emptyCartMsg:         string;
}
