module.exports = {
    featureName: "Example Feature",
    // other features this requires
    requires: [],
    defaultVars: {},
    secretVars: [
        "slasClientSecret"
    ],
    // questions: [
    // ],
    /**
     *
     * @param {MigrationScriptArguments} args
     * @param {FeatureScriptArguments} args2
     * @returns {*[]}
     */
    // eslint-disable-next-line no-unused-vars
    questions: async function ({env, logger, helpers, vars}, {instanceState, featureHelpers, featuresDir, saveSecrets}) {

        const {deployFeature} = featureHelpers

        await deployFeature(env, 'Example Dependency Feature', {featuresDir, saveSecrets, vars})
        return [
            {
                name: 'question',
                message: 'SLAS Client ID?'
            },
            {
                name: 'secret',
                message: 'SLAS Client Secret?'
            }
        ];
    },

    excludeMigrations: [
        "^_.*"
    ],

    excludeCartridges: [
        'plugin_excludeme'
    ],

    /**
     * (Optional) Will remove the feature from the instance
     *
     * @param {Environment} env
     * @param logger
     * @param helpers
     * @param vars
     */
    // eslint-disable-next-line no-unused-vars
    remove: async function ({env, logger, helpers, vars}) {
        // just remove the cartridge
        try {
            if (vars.appliedSites) {
                for (let site of vars.appliedSites) {
                    logger.info(`Removing cartridge from ${site}`)
                    await env.ocapi.delete(`sites/${site}/cartridges/plugin_example`)
                }
            }
        } catch (e) { /* ignore */
        }
    }
}
