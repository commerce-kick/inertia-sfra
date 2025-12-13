/**
 * This APIException is thrown by method BasketMgr.createBasketFromOrder(Order) to indicate
 * no Basket could be created from the Order.
 */
declare class CreateBasketFromOrderException extends APIException {
    private constructor();

    /**
     * Indicates reason why BasketMgr.createBasketFromOrder(Order) failed.
     */
    readonly errorCode: string;
}

export = CreateBasketFromOrderException;
