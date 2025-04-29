export interface WishListShowResponse {
    action:               string;
    queryString:          string;
    locale:               string;
    tracking_consent:     boolean;
    csrf:                 CSRF;
    wishlist:             Wishlist;
    navTabValue:          string;
    rememberMe:           boolean;
    userName:             string;
    actionUrl:            ActionURL;
    actionUrls:           ActionUrls;
    profileForm:          ProfileForm;
    breadcrumbs:          Breadcrumb[];
    oAuthReentryEndpoint: number;
    loggedIn:             LoggedIn;
    firstName:            string;
    socialLinks:          LoggedIn;
    publicOption:         LoggedIn;
    createAccountUrl:     string;
}

export interface ActionURL {
}

export interface ActionUrls {
    updateQuantityUrl: string;
}

export interface Breadcrumb {
    htmlValue: string;
    url:       string;
}

export interface CSRF {
    tokenName: string;
    token:     string;
}

export interface LoggedIn {
    lastName:   string;
    firstName:  string;
    email:      string;
    phone:      string;
    customerNo: string;
}

export interface ProfileForm {
    valid:           boolean;
    htmlName:        string;
    dynamicHtmlName: string;
    error:           null;
    attributes:      string;
    formType:        string;
    customer:        Customer;
    login:           Login;
    base:            ActionURL;
}

export interface Customer {
    valid:           boolean;
    htmlName:        string;
    dynamicHtmlName: string;
    error:           null;
    attributes:      string;
    formType:        string;
    firstname:       Email;
    lastname:        Email;
    email:           Email;
    emailconfirm:    Email;
    phone:           Email;
    addtoemaillist:  Addtoemaillist;
}

export interface Addtoemaillist {
    htmlValue:       string;
    mandatory:       string;
    dynamicHtmlName: string;
    htmlName:        string;
    valid:           boolean;
    label:           string;
    checked:         boolean;
    selected:        boolean;
    formType:        FormType;
}

export enum FormType {
    FormField = "formField",
}

export interface Email {
    htmlValue:       string;
    mandatory:       boolean;
    dynamicHtmlName: string;
    htmlName:        string;
    valid:           boolean;
    label:           string;
    maxLength:       number;
    minLength:       number;
    regEx:           null | string;
    formType:        FormType;
}

export interface Login {
    valid:           boolean;
    htmlName:        string;
    dynamicHtmlName: string;
    error:           null;
    attributes:      string;
    formType:        string;
    password:        Email;
    passwordconfirm: Email;
    currentpassword: Email;
    newpasswords:    Newpasswords;
}

export interface Newpasswords {
    valid:              boolean;
    htmlName:           string;
    dynamicHtmlName:    string;
    error:              null;
    attributes:         string;
    formType:           string;
    newpassword:        Email;
    newpasswordconfirm: Email;
}

export interface Wishlist {
    owner:      Owner;
    publicList: boolean;
    UUID:       string;
    publicView: boolean;
    pageNumber: number;
    items:      TItem[];
    type:       number;
    length:     number;
    showMore:   boolean;
}

export interface TItem {
    pid:               string;
    UUID:              string;
    id:                string;
    name:              string;
    minOrderQuantity:  number;
    maxOrderQuantity:  null;
    qty:               number;
    lastModified:      number;
    creationDate:      number;
    publicItem:        boolean;
    imageObj:          ImageObj;
    priceObj:          PriceObj;
    master:            boolean;
    bundle:            boolean;
    bundleItems:       any[];
    options:           boolean;
    selectedOptions:   null;
    variantAttributes: string;
    readyToOrder:      boolean;
    availability:      Availability;
    available:         boolean;
}

export interface Availability {
    messages:    string[];
    inStockDate: null;
}

export interface ImageObj {
    small: Small[];
}

export interface Small {
    alt:    string;
    url:    string;
    title:  string;
    index:  string;
    absURL: string;
}

export interface PriceObj {
    sales: Sales;
    list:  null;
}

export interface Sales {
    value:        number;
    currency:     string;
    formatted:    string;
    decimalPrice: string;
}

export interface Owner {
    exists:    boolean;
    firstName: string;
    lastName:  string;
}
