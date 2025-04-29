const SOME_CLIENT_ID = "4da87f8f-3352-4376-b416-f5771e650250"

/**
 * Example migration script for updating WebDAV permissions using the helper
 *
 * Can be used standalone, as a migration, or during bootstrap
 *
 * @param {MigrationScriptArguments} options
 * @return {Promise<void>}
 */
module.exports = async function ({env, logger, helpers}) {
    const {ensureWebDAVPermissions} = helpers;

    logger.info(`Setting permissions for client ID ${SOME_CLIENT_ID}`)
    await ensureWebDAVPermissions(env, REQUIRED_PERMISSIONS, async () => {
        // check that we can read sites
        var sites = await env.ocapi.get('sites');
        var firstSiteID = sites.data.data[0].id
        await env.ocapi.get(`sites/${firstSiteID}`);
        return true;
    }, {clientID: SOME_CLIENT_ID});
}

const REQUIRED_PERMISSIONS = [
    {
        "operations": [
            "read_write"
        ],
        "path": "/logs"
    }
];
