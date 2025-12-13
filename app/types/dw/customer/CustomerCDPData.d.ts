/**
 * Represents the read-only Customer's Salesforce CDP (Customer Data Platform) data
 * for a Customer in Commerce Cloud. Please see Salesforce CDP enablement documentation.
 */
declare class CustomerCDPData {
    private constructor();

    /**
     * Return true if the CDPData is empty (has no meaningful data).
     */
    readonly empty: boolean;

    /**
     * An array containing the CDP segments for the customer, or an empty array if no
     * segments found.
     */
    readonly segments: string[];


}

export = CustomerCDPData;
