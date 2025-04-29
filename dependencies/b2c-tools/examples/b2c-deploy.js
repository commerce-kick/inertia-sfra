/* eslint-disable no-unused-vars */
/**
 * Executes during a `code deploy` command before the cartridges are synced;
 *
 * throwing an error will stop the deployment
 *
 * Example:
 * # this will just print an info
 * b2c-tools code deploy
 * # this will throw
 * SFCC_VARS__stopTheDeploy=true b2c-tools code deploy
 *
 * @param {MigrationScriptArguments} args
 * @param {CartridgeMapping[]} cartridges - the cartridges to be synced
 * @return {Promise<void>}
 */
exports.beforeDeploy = async function ({env, logger, helpers, vars}, cartridges) {
    logger.info('Running beforeDeploy lifecycle hook');

    var currentVersion = env.codeVersion;
    var cartridgesToCopy = []
    try {
        var resp = await env.ocapi.get('code_versions')
        currentVersion = resp.data.data.find(cv => cv.active);

        // if the current active version does not match the target code version to be deployed
        // look for custom cartridges to always copy over
        if (currentVersion.id !== env.codeVersion) {
            logger.info(`Looking for custom cartridges`);
            cartridgesToCopy = currentVersion.cartridges.filter(c => c.endsWith('_custom'));
        }

        vars._sourceCodeVersion = currentVersion.id;
        vars._cartridgesToCopy = cartridgesToCopy;
        // or add it to a module level variable
    } catch (e) {
        logger.error(e)
        throw e
    }

    if (vars.stopTheDeploy) {
        throw new Error("STOP THE DEPLOY")
    }
}

/**
 * Executes after cartridges are synced
 * @param {MigrationScriptArguments} args
 * @param {CartridgeMapping[]} cartridges - the cartridges that were synced
 * @return {Promise<void>}
 */
exports.afterDeploy = async function ({env, logger, helpers, vars}, cartridges) {
    logger.info('Running afterDeploy lifecycle hook');

    if (vars._cartridgesToCopy && vars._cartridgesToCopy.length) {
        // copy over the custom cartridges
        logger.info(`Copying ${vars._cartridgesToCopy.length} custom cartridges from ${vars._sourceCodeVersion} to ${env.codeVersion}: ` + vars._cartridgesToCopy.join(', '));
        for (var cartridge of vars._cartridgesToCopy) {
            // call webdav with the COPY method from the source to the target code version
            await env.webdav.request(`Cartridges/${vars._sourceCodeVersion}/${cartridge}`, {
                method: 'COPY',
                // need the full path on the server for COPY
                headers: {Destination: `/on/demandware.servlet/webdav/Sites/Cartridges/${env.codeVersion}/${cartridge}`}
            });
        }
    }
}