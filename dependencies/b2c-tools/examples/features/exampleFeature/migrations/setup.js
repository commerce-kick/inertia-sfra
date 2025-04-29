const VERSION = 5;

module.exports = {
    onBootstrap: async function ({env}, instanceState) {
        instanceState.clients[env.clientID]._exampleFeatureCustomThing = VERSION;
        instanceState.vars._exampleFeatureCustomThing = VERSION;
    },
    shouldBootstrap: async function ({env}, instanceState) {
        return ((!instanceState.clients[env.clientID]._exampleFeatureCustomThing || instanceState.clients[env.clientID]._exampleFeatureCustomThing < VERSION)
            || (!instanceState.vars._exampleFeatureCustomThing || instanceState.vars._exampleFeatureCustomThing < VERSION))
    },
    beforeAll: async function ({logger, vars}) {
        // record all sites we have run this feature on (since siteID will only be relevant for this run)
        // a feature deployment should generally act on ALL sites it's been deployed to and not
        // just the requesting one
        if (!vars.appliedSites) {
            vars.appliedSites = [];
        }
        if (!vars.appliedSites.includes(vars.siteid)) {
            vars.appliedSites.push(vars.siteid)
        }

        // delete this so that it does not always default on subsequent interactive runs
        delete vars.siteid;

        logger.info(JSON.stringify(vars, null, 2));
    },
    afterAll: async function ({env, logger, vars}) {
        logger.info(`Adding cartridge to sites...`)
        for (var site of vars.appliedSites) {
            var siteInfo = await env.ocapi.get(`sites/${site}`);
            var cartridges = siteInfo.data.cartridges.split(':');

            if (cartridges.includes('plugin_example')) {
                continue;
            }

            logger.info(`Adding plugin_example to ${site}`);

            await env.ocapi.post(`sites/${site}/cartridges`, {
                name: 'plugin_example',
                position: 'first'
            })
        }
    }
}
