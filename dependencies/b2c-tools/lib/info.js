/* Info utilities */

const logger = require('./logger')
const {siteArchiveExportJSON} = require("./jobs");
// eslint-disable-next-line no-unused-vars
const Environment = require('./environment');

const snakeToCamel = str =>
    str.toLowerCase().replace(/([-_][a-z])/g, group =>
        group
            .toUpperCase()
            .replace('-', '')
            .replace('_', '')
    );

const snakeToCamelObj = obj => {
    var newObj = {};
    for (let [key, value] of Object.entries(obj)) {
        newObj[snakeToCamel(key)] = value;
    }
    return newObj;
}

// NOTE: these typedefs are not the exhaustive list of properties returned; only
// the most useful information.

/**
 * @typedef {object} Site
 * @property {string} id
 * @property {string[]} cartridges
 * @property {Preferences} preferences
 */

/**
 * @typedef {object} CodeVersion
 * @property {string} id
 * @property {string} compatibilityMode
 * @property {string[]} cartridges
 * @property {boolean} active
 */

/**
 * @typedef {object} InstanceInformationResult
 * @property {CodeVersion[]} codeVersions
 * @property {Site[]} sites
 * @property {Library[]} libraries
 * @property {Object.<string, Preferences>} preferences
 * @property {GlobalPreferences} global
 */

/**
 * @typedef {object} InstanceInformationOptions
 * @property {boolean} codeVersions
 * @property {boolean} sites
 * @property {boolean} libraries
 * @property {boolean} locales
 * @property {boolean} currencies
 * @property {boolean} global
 * @property {boolean} preferences
 * @property {string[]} customPreferences
 */

/**
 * @typedef {object} Library
 * @property {string} id
 * @property {boolean} isSiteLibrary
 * @property {string[]} sites
 */

/**
 * @typedef {object} Preferences
 * @property {string} catalog storefront catalog ID
 * @property {string} customerList
 * @property {string} inventoryList
 * @property {string} timezone
 * @property {string} library
 * @property {string[]} priceBooks
 * @property {string[]} currencies
 * @property {string[]} locales
 * @property {string} defaultLocale
 * @property {string} defaultCurrency
 */

/**
 * @typedef {object} GlobalPreferences
 * @property {string[]} cartridges
 * @property {string} timezone
 */

/**
 * @typedef {object} InstancePreferenceInfo
 * @property {Library[]} libraries
 * @property {GlobalPreferences} globalPreferences
 * @property {Object.<string, Preferences>} sitePreferences site ID to preferences
 */

const getInstanceType = (env) => {
    if (!env || !env.server) return 'sandbox';
    if (env.server.includes('dx.commercecloud')) {
        return 'sandbox';
    } else if (env.server.includes('staging')) {
        return 'staging';
    } else if (env.server.includes('development')) {
        return 'development';
    } else if (env.server.includes('production')) {
        return 'production';
    }
    return 'sandbox';
};

function getPreference(prefXML, preferenceId, instanceType) {
    var prefGroup = 'development'
    if (instanceType === 'staging') {
        prefGroup = 'staging'
    } else if (instanceType === 'production') {
        prefGroup = 'production'
    }

    var prefs = prefXML.preferences['standard-preferences'][0][prefGroup][0].preference;
    try {
        try {
            return prefs.find((p) => p['$']['preference-id'] === preferenceId)['_']
        } catch (e) {
            prefs = prefXML.preferences['standard-preferences'][0]['all-instances'][0].preference;
        }
        return prefs.find((p) => p['$']['preference-id'] === preferenceId)['_']
    } catch (e) {
        logger.warn(`Can't query preference ${preferenceId}: ${e.message}`)
        return null;
    }
}

function getCustomPreference(prefXML, preferenceId, instanceType) {
    var prefGroup = 'development'
    if (instanceType === 'staging') {
        prefGroup = 'staging'
    } else if (instanceType === 'production') {
        prefGroup = 'production'
    }

    var prefs = prefXML.preferences['custom-preferences'][0][prefGroup][0].preference;
    try {
        try {
            return prefs.find((p) => p['$']['preference-id'] === preferenceId)['_']
        } catch (e) {
            prefs = prefXML.preferences['custom-preferences'][0]['all-instances'][0].preference;
        }
        return prefs.find((p) => p['$']['preference-id'] === preferenceId)['_']
    } catch (e) {
        logger.debug(`Can't query custom preference ${preferenceId}: ${e.message}`)
        return;
    }
}

/**
 * Get useful site and global information
 * @param {Environment} env
 * @param {object} options
 * @param {string[]} options.customPreferences list of custom preferences to retrieve
 * @return {Promise<InstancePreferenceInfo>}
 */
async function getInstancePreferenceInfo(env, options = {
    customPreferences: []
}) {
    const {customPreferences} = options;
    const dataUnits = {
        sites: {
            all: {
                site_preferences: true,
                site_descriptor: true
            }
        },
        global_data: {
            preferences: true
        }
    }
    const archive = await siteArchiveExportJSON(env, dataUnits)
    var libraryMappings = {}
    /** @type {Object.<string, Preferences>} */
    var preferenceMapping = {}
    var instanceType = getInstanceType(env)
    for (let [file, sitePrefs] of archive.entries()) {
        if (!file.includes('/') || !file.endsWith('preferences.xml')) {
            // not a site preference
            continue;
        }
        var site = file.split('/')[1]
        var libraryID = getPreference(sitePrefs, 'SiteLibrary', instanceType)
        var isSiteLibrary = libraryID === site
        if (libraryMappings[libraryID]) {
            libraryMappings[libraryID].sites.push(site);
        } else {
            libraryMappings[libraryID] = {
                id: libraryID,
                isSiteLibrary,
                sites: [site]
            }
        }

        var siteDescriptor = archive.get(`sites/${site}/site.xml`)
        var defaultCurrency = siteDescriptor.site.currency[0]
        var locales = getPreference(sitePrefs, 'SiteLocales', instanceType) ? getPreference(sitePrefs, 'SiteLocales', instanceType).split(':') : []
        // prefs
        preferenceMapping[site] = {
            library: libraryID,
            catalog: getPreference(sitePrefs, 'SiteCatalog', instanceType),
            timezone: getPreference(sitePrefs, 'SiteTimezone', instanceType),
            priceBooks: getPreference(sitePrefs, 'SitePriceBooks', instanceType) ? getPreference(sitePrefs, 'SitePriceBooks', instanceType).split(':') : [],
            locales: locales,
            currencies: getPreference(sitePrefs, 'SiteCurrencies', instanceType) ? getPreference(sitePrefs, 'SiteCurrencies', instanceType).split(':') : [],
            inventoryList: getPreference(sitePrefs, 'SiteInventoryList', instanceType),
            customerList: getPreference(sitePrefs, 'SiteCustomerList', instanceType),
            defaultLocale: getPreference(sitePrefs, 'SiteDefaultLocale', instanceType),
            defaultCurrency: defaultCurrency
        }

        if (customPreferences) {
            customPreferences.forEach(customPref => {
                preferenceMapping[site][customPref] = getCustomPreference(sitePrefs, customPref, instanceType)
            })
        }
    }

    var globalPrefsXML = archive.get('preferences.xml')
    var globalPreferences = {
        cartridges: getPreference(globalPrefsXML, "CustomCartridges", instanceType) ? getPreference(globalPrefsXML, "CustomCartridges", instanceType).split(':') : [],
        timezone: getPreference(globalPrefsXML, "InstanceTimezone", instanceType),
    }
    if (customPreferences) {
        customPreferences.forEach(customPref => {
            globalPreferences[customPref] = getCustomPreference(globalPrefsXML, customPref, instanceType)
        })
    }

    return {
        libraries: Object.values(libraryMappings),
        sitePreferences: preferenceMapping,
        globalPreferences
    }
}

/**
 * Query various information from instance
 *
 * @param {Environment} env
 * @param {Partial<InstanceInformationOptions>} options of booleans for information to query
 * @return {Promise<InstanceInformationResult>}
 */
async function getInstanceInfo(env, options = {
    codeVersions: true,
    sites: true,
    libraries: true,
    global: true,
    preferences: true,
    customPreferences: []
}) {
    var result = {}
    var librarySiteMapping = {}
    var instancePrefs

    // code versions
    if (options.codeVersions) {
        try {
            let resp = await env.ocapi.get('code_versions')
            result.codeVersions = resp.data.data.map(c => snakeToCamelObj(c));
        } catch (e) {
            logger.error('Cannot query code_versions; ensure you have code_versions resource permissions (DATA API)')
            logger.error(e.message)
        }
    }

    if (options.libraries || options.global || options.preferences) {
        try {
            instancePrefs = await getInstancePreferenceInfo(env, {
                customPreferences: options.customPreferences
            })

            if (options.libraries) {
                let libraries = instancePrefs.libraries
                result.libraries = libraries;
                libraries.forEach(l => l.sites.forEach(s => librarySiteMapping[s] = l))
            }

            if (options.preferences) {
                result.preferences = instancePrefs.sitePreferences
            }

            if (options.global) {
                result.global = instancePrefs.globalPreferences
            }
        } catch (e) {
            logger.error('Cannot query instance preference info')
            logger.error(e.message)
        }
    }

    if (options.sites) {
        try {
            let resp = await env.ocapi.get('sites?select=(**)&count=100')
            result.sites = resp.data.data.map(s => snakeToCamelObj(s)).map(s => {
                var _s = {
                    ...s,
                    cartridges: s.cartridges.split(':')
                }

                if (instancePrefs && instancePrefs.sitePreferences[s.id]) {
                    _s.preferences = instancePrefs.sitePreferences[s.id]
                }

                return _s;
            });
        } catch (e) {
            logger.error('Cannot query sites; ensure you have sites resource permissions (DATA API)')
            logger.error(e.message)
        }
    }

    return result
}

module.exports = {
    getInstanceInfo,
    getInstancePreferenceInfo
}
