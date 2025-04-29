// eslint-disable-next-line no-unused-vars
const Environment = require('./environment');
const logger = require("./logger");

/**
 * @typedef {Object} FeatureState
 * @property {string} featureName
 * @property {object} vars
 * @property {Date} creationDate
 * @property {Date} lastModified
 */

/**
 * @typedef {Object} FeaturesClientState
 * @property {number} version
 */

/**
 * @typedef {Object} InstanceFeatureState
 * @property {number} b2cToolsFeaturesVersion
 * @property {Object.<string, FeaturesClientState>} b2cToolsFeaturesBootstrappedClientIDs
 * @property {FeatureState[]} features
 */

/**
 * @param {Object} obj
 * @returns {FeatureState}
 */
function featureStateFromCustomObject(obj) {
    let vars = {};
    if (obj.c_vars && obj.c_vars.length > 0) {
        vars = Object.assign({}, JSON.parse(obj.c_vars))
    }
    if (obj.c_secretVars && obj.c_secretVars.length > 0) {
        vars = Object.assign({}, vars, JSON.parse(obj.c_secretVars))
    }

    return {
        featureName: obj.key_value_string,
        lastModified: new Date(obj.last_modified),
        creationDate: new Date(obj.creation_date),
        vars: vars
    }
}

/**
 * Get the current state of features
 *
 * @param {Environment} env
 * @returns {Promise<InstanceFeatureState|null>}  returns null if instance feature state is blocked
 */
async function getInstanceFeatureState(env) {
    try {
        var resp = await env.ocapi.get(`/global_preferences/preference_groups/b2cToolkit/development`);
        /** @type {Object.<string, FeaturesClientState>} */
        var bootstrappedClientIDs = {};
        try {
            bootstrappedClientIDs = JSON.parse(resp.data.c_b2cToolsFeaturesBootstrappedClientIDs)
        } catch (e) { /* ignore; will recreate as json */
        }

        /** @type {InstanceFeatureState} */
        var state = {
            b2cToolsFeaturesVersion: resp.data.c_b2cToolsFeaturesVersion,
            b2cToolsFeaturesBootstrappedClientIDs: bootstrappedClientIDs,
            features: []
        };

        resp = await env.ocapi.post('custom_objects_search/B2CToolsFeature', {
            query: {
                match_all_query: {}
            },
            "select": "(**)"
        })

        if (resp.data.count > 0) {
            state.features = resp.data.hits.map((hit) => featureStateFromCustomObject(hit))
        }

        return state;
    } catch (e) {
        if (e.response && (e.response.status === 403 || e.response.status === 404)) {
            logger.warn('No access to features; Bootstrap required');
        } else {
            throw e;
        }
    }
    return null;
}

/**
 * Updates feature state on instance
 *
 * @param {Environment} env
 * @param {string} featureName
 * @param {object} vars
 * @param {string[]} secretVars
 * @param {boolean} saveSecrets
 * @returns {Promise<void>}
 */
async function updateFeatureState(env, featureName, vars, secretVars, saveSecrets) {
    var targetVars = Object.assign({}, vars);
    var targetSecretVars = {};
    if (secretVars) {
        secretVars.forEach((key) => {
            if (saveSecrets) {
                targetSecretVars[key] = targetVars[key];
                if (targetVars[key]) { // only mask if it's actually there
                    targetVars[key] = "*****"
                }
            } else if (targetVars[key]) {
                delete targetVars[key]
            }
        })
    }

    var exists = true;
    try {
        await env.ocapi.get(`custom_objects/B2CToolsFeature/${featureName}`)
    } catch (e) {
        if (e.response && e.response.status === 404) {
            exists = false;
        } else {
            throw e;
        }
    }

    if (exists) {
        await env.ocapi.patch(`custom_objects/B2CToolsFeature/${featureName}`, {
            c_vars: JSON.stringify(targetVars, null, 2),
            c_secretVars: JSON.stringify(targetSecretVars, null, 2)
        })
    } else {
        await env.ocapi.put(`custom_objects/B2CToolsFeature/${featureName}`, {
            c_vars: JSON.stringify(targetVars, null, 2),
            c_secretVars: JSON.stringify(targetSecretVars, null, 2)
        })
    }
}

module.exports = {
    getInstanceFeatureState,
    updateFeatureState
}