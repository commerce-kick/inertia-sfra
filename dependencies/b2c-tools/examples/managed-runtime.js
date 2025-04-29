#!/usr/bin/env node

/**
 *
 * Example Managed Runtime usage
 *
 * @param {MigrationScriptArguments} options
 * @return {Promise<void>}
 */
module.exports = async function ({env, logger, /* vars */}) {
    var resp = await env.mrt(`api/projects/`);
    logger.info(JSON.stringify(resp.data, null, 2));
};

// Can also be awaited if using top level await supported node (>=14.8)
// require.main === module && require('@SalesforceCommerceCloud/b2c-tools').runAsScript()
require.main === module && require('../lib/index').runAsScript()

