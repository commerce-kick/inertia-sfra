export type Site = {
    id: string;
    cartridges: string[];
    preferences: Preferences;
};
export type CodeVersion = {
    id: string;
    compatibilityMode: string;
    cartridges: string[];
    active: boolean;
};
export type InstanceInformationResult = {
    codeVersions: CodeVersion[];
    sites: Site[];
    libraries: Library[];
    preferences: {
        [x: string]: Preferences;
    };
    global: GlobalPreferences;
};
export type InstanceInformationOptions = {
    codeVersions: boolean;
    sites: boolean;
    libraries: boolean;
    locales: boolean;
    currencies: boolean;
    global: boolean;
    preferences: boolean;
    customPreferences: string[];
};
export type Library = {
    id: string;
    isSiteLibrary: boolean;
    sites: string[];
};
export type Preferences = {
    /**
     * storefront catalog ID
     */
    catalog: string;
    customerList: string;
    inventoryList: string;
    timezone: string;
    library: string;
    priceBooks: string[];
    currencies: string[];
    locales: string[];
    defaultLocale: string;
    defaultCurrency: string;
};
export type GlobalPreferences = {
    cartridges: string[];
    timezone: string;
};
export type InstancePreferenceInfo = {
    libraries: Library[];
    globalPreferences: GlobalPreferences;
    /**
     * site ID to preferences
     */
    sitePreferences: {
        [x: string]: Preferences;
    };
};
/**
 * Query various information from instance
 *
 * @param {Environment} env
 * @param {Partial<InstanceInformationOptions>} options of booleans for information to query
 * @return {Promise<InstanceInformationResult>}
 */
export function getInstanceInfo(env: Environment, options?: Partial<InstanceInformationOptions>): Promise<InstanceInformationResult>;
/**
 * Get useful site and global information
 * @param {Environment} env
 * @param {object} options
 * @param {string[]} options.customPreferences list of custom preferences to retrieve
 * @return {Promise<InstancePreferenceInfo>}
 */
export function getInstancePreferenceInfo(env: Environment, options?: {
    customPreferences: string[];
}): Promise<InstancePreferenceInfo>;
import Environment = require("./environment");
//# sourceMappingURL=info.d.ts.map