#!/usr/bin/env node
/* eslint-disable no-unused-vars */

const {deployFeature} = require("../lib/features");
/**
 * @param {MigrationScriptArguments} args
 * @return {Promise<void>}
 */
module.exports = async function ({env, logger, helpers, vars}) {
    logger.info('Deploying Example Feature')
    await deployFeature(env, "Example Feature", {featuresDir: helpers.CONFIG.FEATURES_DIR, vars});
};

require.main === module &&
require('@SalesforceCommerceCloud/b2c-tools')
    .runAsScript();
