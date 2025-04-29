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
     * @param {Environment} env
     * @param logger
     * @param helpers
     * @param vars
     * @returns {*[]}
     */
    // eslint-disable-next-line no-unused-vars
    questions: async function ({env, logger, helpers, vars}) {
        var sites = await env.ocapi.get('sites?select=(**)')
        var siteIds = sites.data.data.map(s => s.id);

        if (vars.appliedSites) {
            var lastSiteApplied = vars.appliedSites[vars.appliedSites.length - 1]
        }
        if (!process.stdin.isTTY && !vars.siteID && vars.appliedSites) {
            // in non-interactive mode (CI) where we were not given a siteID use the last site applied
            // so the questions do not fail. If it's never been deployed before and this situation occurs
            // then the questions will throw an exception and fail the run
            vars.siteID = lastSiteApplied;
        }

        return [
            {
                name: 'siteid',
                message: 'Which site?',
                type: 'list',
                choices: siteIds,
                default: lastSiteApplied
            },
            {
                name: 'slasClientID',
                message: 'SLAS Client ID?'
            },
            {
                name: 'slasClientSecret',
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
        } catch(e) { /* ignore */ }
    }
}
