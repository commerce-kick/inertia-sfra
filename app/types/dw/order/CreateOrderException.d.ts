/**
 * This APIException is thrown by method OrderMgr.createOrder(Basket, String) to indicate
 * no Order could be created from the Basket.
 */
declare class CreateOrderException extends APIException {
    private constructor();
}

export = CreateOrderException;
