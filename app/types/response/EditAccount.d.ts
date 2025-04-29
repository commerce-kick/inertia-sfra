export interface EditAccountProps {
  currentCustomer: CurrentCustomer;
  staticUrl: string;
  navBar: NavBar;
  locale: string;
  action: string;
  queryString: string;
  csrf: CSRF;
  tracking_consent: null;
  consentApi: boolean;
  caOnline: boolean;
  profileForm: ProfileForm;
  breadcrumbs: Breadcrumb[];
}

export interface Breadcrumb {
  htmlValue: string;
  url: string;
}

export interface CSRF {
  tokenName: string;
  token: string;
}

export interface CurrentCustomer {
  raw: Raw;
  profile: Profile;
  addressBook: AddressBook;
  wallet: Wallet;
}

export interface AddressBook {
  preferredAddress: Address;
  addresses: Address[];
}

export interface Address {
  address1: string;
  address2: null;
  city: string;
  companyName: null;
  countryCode: CountryCode;
  firstName: string;
  lastName: string;
  ID: string;
  phone: string;
  postalCode: string;
  stateCode: null;
  postBox: null;
  salutation: null;
  secondName: null;
  suffix: null;
  suite: null;
  title: null;
  raw: Raw;
}

export interface CountryCode {
  displayValue: string;
  value: string;
}

export interface Raw {}

export interface Profile {
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  customerNo: string;
}

export interface Wallet {
  paymentInstruments: PaymentInstrument[];
}

export interface PaymentInstrument {
  creditCardHolder: string;
  maskedCreditCardNumber: string;
  creditCardType: string;
  creditCardExpirationMonth: number;
  creditCardExpirationYear: number;
  UUID: string;
  creditCardNumber: string;
  raw: Raw;
}

export interface NavBar {
  categories: Category[];
}

export interface Category {
  name: string;
  url: string;
  id: string;
  subCategories?: CategorySubCategory[];
  complexSubCategories?: boolean;
}

export interface CategorySubCategory {
  name: string;
  url: string;
  id: string;
  subCategories?: SubCategorySubCategory[];
  complexSubCategories?: boolean;
}

export interface SubCategorySubCategory {
  name: string;
  url: string;
  id: string;
}

export interface ProfileForm {
  valid: boolean;
  htmlName: string;
  dynamicHtmlName: string;
  error: null;
  attributes: string;
  formType: string;
  customer: Customer;
  login: Login;
  base: Raw;
}

export interface Customer {
  valid: boolean;
  htmlName: string;
  dynamicHtmlName: string;
  error: null;
  attributes: string;
  formType: string;
  firstname: Email;
  lastname: Email;
  email: Email;
  emailconfirm: Email;
  phone: Email;
  addtoemaillist: Addtoemaillist;
  gender: Email;
}

export interface Addtoemaillist {
  htmlValue: string;
  mandatory: string;
  dynamicHtmlName: string;
  htmlName: string;
  valid: boolean;
  label: string;
  checked: boolean;
  selected: boolean;
  formType: FormType;
}

export enum FormType {
  FormField = "formField",
}

export interface Email {
  htmlValue: string;
  mandatory: boolean;
  dynamicHtmlName: string;
  htmlName: string;
  valid: boolean;
  label: string;
  maxLength: number;
  minLength: number;
  regEx: null | string;
  formType: FormType;
  options?: Option[];
  selectedOption?: string;
}

export interface Option {
  checked: boolean;
  htmlValue: string;
  label: string;
  id: string;
  selected: boolean;
  value: string;
}

export interface Login {
  valid: boolean;
  htmlName: string;
  dynamicHtmlName: string;
  error: null;
  attributes: string;
  formType: string;
  password: Email;
  passwordconfirm: Email;
  currentpassword: Email;
  newpasswords: Newpasswords;
}

export interface Newpasswords {
  valid: boolean;
  htmlName: string;
  dynamicHtmlName: string;
  error: null;
  attributes: string;
  formType: string;
  newpassword: Email;
  newpasswordconfirm: Email;
}
