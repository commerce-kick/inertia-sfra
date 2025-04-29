#!/usr/bin/env node

/**
 * Demonstrates making a migration script executable directly (i.e. not via `import run`)
 *
 * This essentially makes the migration script an extension of b2c-tools
 *
 * @param {MigrationScriptArguments} options
 * @return {Promise<void>}
 */
// eslint-disable-next-line no-unused-vars
module.exports = async function ({env, logger, helpers, vars}) {
    logger.info(env.server);
    logger.info(helpers.CONFIG.MIGRATIONS_DIR)
}

// Can also be awaited if using top level await supported node (>=14.8)
// require.main === module && require('@SalesforceCommerceCloud/b2c-tools').runAsScript()
require.main === module && require('../lib/index').runAsScript()


