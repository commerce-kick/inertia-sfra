import SortingRule = require('./SortingRule');

declare class SortingOption {

    /**
     * The description of the sorting option for the current locale.
     */
    readonly description  :  string

    /**
     * The display name of the of the sorting option for the current locale.
     */
    readonly displayName  :  string

    /**
     * The ID of the sorting option.
     */
    readonly ID  :  string

    /**
     * The sorting rule for this sorting option, or null if there is no associated rule.
     */
    readonly sortingRule  :  SortingRule | null

    private constructor();


}

export = SortingOption;
