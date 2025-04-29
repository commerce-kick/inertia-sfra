
/**
 *
 * Example SCAPI SLAS client list
 *
 * short-code must be configured
 *
 * @param {MigrationScriptArguments} options
 * @return {Promise<void>}
 */
module.exports = async function ({env, logger, /* vars */}) {
    // only works for ODS; pass tenant as a var
    var tenantID = env.server.split('.').shift().replace('-', '_');
    // var tenantID = vars.tenantID;

    var resp = await env.scapi(`shopper/auth-admin/v1/tenants/${tenantID}/clients`);

    logger.info(`Current SLAS client list for ${tenantID}`)
    logger.info(JSON.stringify(resp.data, null, 2));
};

