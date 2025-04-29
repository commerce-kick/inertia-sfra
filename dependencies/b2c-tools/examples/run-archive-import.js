const path = require("path");

/**
 * Example of running an arbitrary site import/export
 * For instance: to import an archive on every tool run (regardless of migrations)
 * this can be placed inside the beforeAll lifecycle method
 *
 * @param {MigrationScriptArguments} options
 * @return {Promise<void>}
 */
module.exports = async function ({env, logger, helpers}) {
    logger.info("==== RUNNING COMMON METADATA IMPORT ====")
    await helpers.siteArchiveImport(env, path.join(helpers.CONFIG.MIGRATIONS_DIR, "_METADATA"));
    logger.info("==== FINISHED COMMON METADATA IMPORT ====")
}
