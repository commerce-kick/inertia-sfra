export interface CheckoutResponse {
    currentCustomer: CurrentCustomer
    staticUrl: string
    navBar: NavBar
    action: string
    queryString: string
    locale: string
    tracking_consent: null
    csrf: CSRF
    order: Order
    customer: Customer
    forms: Forms
    expirationYears: number[]
    currentStage: string
    reportingURLs: Raw[]
    oAuthReentryEndpoint: number
  }
  
  export interface CSRF {
    tokenName: string
    token: string
  }
  
  export interface CurrentCustomer {
    raw: Raw
    profile: Profile
    addressBook: AddressBook
    wallet: Wallet
  }
  
  export interface AddressBook {
    preferredAddress: Address
    addresses: Address[]
  }
  
  export interface Address {
    address1: string
    address2: null
    city: string
    companyName: null
    countryCode: CountryCode
    firstName: string
    lastName: string
    ID: null | string
    phone: string
    postalCode: string
    stateCode: null
    postBox: null
    salutation: null
    secondName: null
    suffix: null
    suite: null
    title: null
    raw?: Raw
    addressId?: null | string
    jobTitle?: null
  }
  
  export interface CountryCode {
    displayValue: string
    value: string
  }
  
  export type Raw = {}
  
  export interface Profile {
    lastName: string
    firstName: string
    email: string
    phone: string
    customerNo?: string
    password?: string
  }
  
  export interface Wallet {
    paymentInstruments: PaymentInstrument[]
  }
  
  export interface PaymentInstrument {
    creditCardHolder: string
    maskedCreditCardNumber: string
    creditCardType: string
    creditCardExpirationMonth: number
    creditCardExpirationYear: number
    UUID: string
    creditCardNumber?: string
    raw?: Raw
    cardTypeImage?: CardTypeImage
  }
  
  export interface CardTypeImage {
    src: Raw
    alt: string
  }
  
  export interface Customer {
    profile: Profile
    addresses: Address[]
    preferredAddress: Address
    payment: CustomerPayment
    registeredUser: boolean
    isExternallyAuthenticated: boolean
    customerPaymentInstruments: PaymentInstrument[]
  }
  
  export interface CustomerPayment {
    maskedCreditCardNumber: string
    creditCardType: string
    creditCardExpirationMonth: number
    creditCardExpirationYear: number
  }
  
  export interface Forms {
    guestCustomerForm: GuestCustomerForm
    registeredCustomerForm: GuestCustomerForm
    shippingForm: ShippingForm
    billingForm: BillingForm
  }
  
  export interface BillingForm {
    valid: boolean
    htmlName: string
    dynamicHtmlName: string
    error: null
    attributes: string
    formType: string
    shippingAddressUseAsBillingAddress: ShippingAddressUseAsBillingAddress
    addressFields: AddressFields
    contactInfoFields: GuestCustomerForm
    paymentMethod: PaymentMethod
    creditCardFields: CreditCardFields
    subscribe: ShippingAddressUseAsBillingAddress
    base: Raw
  }
  
  export interface AddressFields {
    valid: boolean
    htmlName: string
    dynamicHtmlName: string
    error: null
    attributes: string
    formType: string
    addressId: PaymentMethod
    firstName: PaymentMethod
    lastName: PaymentMethod
    address1: PaymentMethod
    address2: ProductLineItemUUID
    city: PaymentMethod
    postalCode: PaymentMethod
    country: PaymentMethod
    states: GuestCustomerForm
    phone: PaymentMethod
    apply: Apply
    remove: Apply
  }
  
  export interface PaymentMethod {
    htmlValue: string
    mandatory: boolean
    dynamicHtmlName: string
    htmlName: string
    valid: boolean
    label?: string
    maxLength: number
    minLength: number
    regEx: null | string
    formType: FormType
    options?: PaymentMethodOption[]
    selectedOption?: string
    description?: string
  }
  
  export enum FormType {
    FormField = "formField",
  }
  
  export interface PaymentMethodOption {
    checked: boolean
    htmlValue: string
    label: string
    id: string
    selected: boolean
    value: null | string
  }
  
  export interface ProductLineItemUUID {
    htmlValue: string
    mandatory: string
    dynamicHtmlName: string
    htmlName: string
    valid: boolean
    label?: string
    maxLength: number
    minLength: number
    regEx: null
    formType: FormType
  }
  
  export interface Apply {
    description: null
    label: null
    submitted: boolean
    triggered: boolean
    formType: string
  }
  
  export interface GuestCustomerForm {
    valid: boolean
    htmlName: string
    dynamicHtmlName: string
    error: null
    attributes: string
    formType: string
    stateCode?: PaymentMethod
    phone?: PaymentMethod
    email?: PaymentMethod
    base?: Raw
    password?: PaymentMethod
  }
  
  export interface CreditCardFields {
    valid: boolean
    htmlName: string
    dynamicHtmlName: string
    error: null
    attributes: string
    formType: string
    editNumber: ProductLineItemUUID
    paymentMethod: PaymentMethod
    cardType: PaymentMethod
    cardNumber: PaymentMethod
    cardOwner: PaymentMethod
    expirationMonth: ExpirationMonth
    expirationYear: ExpirationYear
    securityCode: PaymentMethod
    saveCard: ShippingAddressUseAsBillingAddress
  }
  
  export interface ExpirationMonth {
    htmlValue: string
    mandatory: boolean
    dynamicHtmlName: string
    htmlName: string
    valid: boolean
    label: string
    options: ExpirationMonthOption[]
    selectedOption: string
    maxValue: null
    minValue: null
    formType: FormType
  }
  
  export interface ExpirationMonthOption {
    checked: boolean
    htmlValue: string
    label: string
    id: string
    selected: boolean
    value: number | null
  }
  
  export interface ExpirationYear {
    htmlValue: string
    mandatory: boolean
    dynamicHtmlName: string
    htmlName: string
    valid: boolean
    label: string
    options: PaymentMethodOption[]
    selectedOption: string
    maxValue: null
    minValue: null
    formType: FormType
  }
  
  export interface ShippingAddressUseAsBillingAddress {
    htmlValue: string
    mandatory: string
    dynamicHtmlName: string
    htmlName: string
    valid: boolean
    label?: string
    checked: boolean
    selected: boolean
    formType: FormType
  }
  
  export interface ShippingForm {
    valid: boolean
    htmlName: string
    dynamicHtmlName: string
    error: string
    attributes: string
    formType: string
    shipmentUUID: ProductLineItemUUID
    productLineItemUUID: ProductLineItemUUID
    shippingAddress: ShippingAddress
    base: Raw
  }
  
  export interface ShippingAddress {
    valid: boolean
    htmlName: string
    dynamicHtmlName: string
    error: string
    attributes: string
    formType: string
    addressFields: AddressFields
    shippingMethodID: PaymentMethod
    shippingAddressUseAsBillingAddress: ShippingAddressUseAsBillingAddress
    isGift: ShippingAddressUseAsBillingAddress
    giftMessage: ProductLineItemUUID
    save: Apply
  }
  
  export interface NavBar {
    categories: Category[]
  }
  
  export interface Category {
    name: string
    url: string
    id: string
    subCategories?: CategorySubCategory[]
    complexSubCategories?: boolean
  }
  
  export interface CategorySubCategory {
    name: string
    url: string
    id: string
    subCategories?: SubCategorySubCategory[]
    complexSubCategories?: boolean
  }
  
  export interface SubCategorySubCategory {
    name: string
    url: string
    id: string
  }
  
  export interface Order {
    resources?: Resources
    shippable?: boolean
    usingMultiShipping?: boolean
    orderNumber?: null
    priceTotal?: string
    creationDate?: Date
    orderEmail: string
    orderStatus?: null
    productQuantityTotal?: number
    totals: Totals
    steps?: Steps
    items: Items
    billing?: Billing
    shipping?: Shipping[]
  }
  
  export interface Billing {
    billingAddress: BillingAddress
    payment: BillingPayment
    matchingAddressId: string
  }
  
  export interface BillingAddress {
    address?: Address
  }
  
  export interface BillingPayment {
    applicablePaymentMethods: ApplicablePaymentMethod[]
    applicablePaymentCards: ApplicablePaymentCard[]
    selectedPaymentInstruments: any[]
  }
  
  export interface ApplicablePaymentCard {
    cardType: string
    name: string
  }
  
  export interface ApplicablePaymentMethod {
    ID: string
    name: string
  }
  
  export interface Items {
    items: Item[]
    totalQuantity: number
  }
  
  export interface Item {
    uuid: string
    id: string
    productName: string
    productType?: string
    brand?: null
    price: Price
    renderedPrice?: string
    images: Images
    variationAttributes?: VariationAttribute[]
    availability?: Availability
    available?: boolean
    quantity: number
    isGift?: boolean
    renderedPromotions?: string
    UUID: string
    isOrderable?: boolean
    shipmentUUID: string
    isBonusProductLineItem?: boolean
    priceTotal: PriceTotal
    quantityOptions?: QuantityOptions
    options?: any[]
    bonusProductLineItemUUID?: null
    preOrderUUID?: null
    discountLineItems?: any[]
    giftRegistryItem?: boolean
    giftRegistryItemTag?: null
    bonusProducts?: null
  }
  
  export interface Availability {
    messages: string[]
    inStockDate: null
  }
  
  export interface Images {
    small: Small[]
  }
  
  export interface Small {
    alt: string
    url: string
    title: string
    index?: string
    absURL: string
  }
  
  export interface Price {
    sales: Sales
    list: Sales | null
  }
  
  export interface Sales {
    value: number
    currency: string
    formatted: string
    decimalPrice: string
  }
  
  export interface PriceTotal {
    price: string
    renderedPrice?: string
  }
  
  export interface QuantityOptions {
    minOrderQuantity: number
    maxOrderQuantity: number
  }
  
  export interface VariationAttribute {
    displayName: string
    displayValue: string
    attributeId: string
    id: string
  }
  
  export interface Resources {
    noSelectedPaymentMethod: string
    cardType: string
    cardEnding: string
    shippingMethod: string
    items: string
    item: string
    addNewAddress: string
    newAddress: string
    shipToAddress: string
    shippingAddresses: string
    accountAddresses: string
    shippingTo: string
    shippingAddress: string
    addressIncomplete: string
    giftMessage: string
  }
  
  export interface Shipping {
    UUID: string
    productLineItems: Items
    applicableShippingMethods: ShippingMethod[]
    selectedShippingMethod: ShippingMethod
    matchingAddressId: string
    shippingAddress: Address
    isGift: boolean
    giftMessage: null
  }
  
  export interface ShippingMethod {
    ID: string
    displayName: string
    description: string
    estimatedArrivalTime: string
    default: boolean
    shippingCost: string
    selected: boolean
  }
  
  export interface Steps {
    shipping: Ing
    billing: Ing
  }
  
  export interface Ing {
    iscompleted: boolean
  }
  
  export interface Totals {
    subTotal: string
    totalShippingCost: string
    grandTotal: string
    totalTax: string
    orderLevelDiscountTotal: LevelDiscountTotal
    shippingLevelDiscountTotal: LevelDiscountTotal
    discounts?: any[]
    discountsHtml?: string
  }
  
  export interface LevelDiscountTotal {
    value: number
    formatted: string
  }
  
  