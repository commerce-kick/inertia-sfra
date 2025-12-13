import Collection = require('../util/Collection');
import Promotion = require('./Promotion');
import ShippingMethod = require('../order/ShippingMethod');
import Product = require('../catalog/Product');
import PaymentCard = require('../order/PaymentCard');
import PaymentMethod = require('../order/PaymentMethod')


type SORT_BY_EXCLUSIVITY = 1;
type SORT_BY_START_DATE = 2;


/**
 * PromotionPlan represents a set of Promotion instances and is used to display active or upcoming promotions on storefront pages, or to pass it to the PromotionMgr to calculate a DiscountPlan and subsequently apply discounts to a line item container. Instances of the class are returned by the PromotionMgr.getActivePromotions(), PromotionMgr.getActiveCustomerPromotions() and PromotionMgr.getUpcomingPromotions(Number).
PromotionPlan provides methods to access the promotions in the plan and to remove promotions from the plan. All methods which return a collection of promotions sort them by the following ordered criteria:

 1. Exclusivity: GLOBAL exclusive promotions first, followed by CLASS exclusive promotions, and NO exclusive promotions last.
 2. Rank: sorted ascending
 3. Promotion Class: PRODUCT promotions first, followed by ORDER promotions, and SHIPPING  promotions last.
 4. Discount type: Fixed price promotions first, followed by free, amount-off, percentage-off, and bonus product promotions last.
 5. Best discount: Sorted descending. For example, 30% off comes before 20% off.
 6. ID: alphanumeric ascending.

 See Also:
PromotionMgr
 */
declare class PromotionPlan {
    /**
     *     Constant indicating that a collection of promotions should be sorted first by exclusivity, then rank, promotion class, etc. See class-level javadoc for details. This is the default sort order for methods that return a collection of promotions.
     */
    static readonly SORT_BY_EXCLUSIVITY: SORT_BY_EXCLUSIVITY;

    /**
     *     Constant indicating that a collection of promotions should be sorted by start date ascending. If there is no explicit start date for a promotion the start date of its containing Campaign or AB-test is used instead. Promotions without a start date are sorted before promotions with a start date in the future and after promotions with a start date in the past. In case two promotion assignments have the same start date, they are sorted by their ID.
     */
    static readonly SORT_BY_START_DATE: SORT_BY_START_DATE;

    private constructor();


}

export = PromotionPlan;
