
/**
 * Vars test
 *
 * @param {MigrationScriptArguments} options
 * @return {Promise<void>}
 */
module.exports = async function ({env: _env, logger, helpers: _helpers, vars}) {
    logger.info(`Vars Contents:`);
    logger.info(JSON.stringify(vars, null, 2));
}
