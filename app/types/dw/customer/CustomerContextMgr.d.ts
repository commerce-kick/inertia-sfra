/**
 * Provides helper methods for managing customer context, such as the Effective
 * Time for which the customer is shopping at.
 */
declare class CustomerContextMgr {
    private constructor();

    /**
     * Get the effective time associated with the customer. By default, the effective
     * time is null.
     */
    static readonly effectiveTime: Date | null;


}

export = CustomerContextMgr;
