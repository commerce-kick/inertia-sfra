import ActiveData = require('../object/ActiveData');


declare class CustomerActiveData extends ActiveData {
    avgOrderValue  :  number;
    discountValueWithCoupon  :  number;
    discountValueWithoutCoupon  :  number;
    giftOrders  :  number;
    giftUnits  :  number;
    lastOrderDate  :  Date;
    orders  :  number;
    orderValue  :  number;
    orderValueMonth  :  number;

    productMastersOrdered  :  string[];
    productsAbandonedMonth  :  string[];
    productsOrdered  :  string[];
    productsViewedMonth  :  string[];
    returns  :  number;
    returnValue  :  number;
    sourceCodeOrders  :  number;
    topCategoriesOrdered  :  string[];
    visitsMonth  :  number;
    visitsWeek  :  number;
    visitsYear  :  number;

}
export = CustomerActiveData;
