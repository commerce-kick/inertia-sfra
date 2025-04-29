/**
 * Using Impex Helpers
 *
 * @param {MigrationScriptArguments} options
 * @return {Promise<void>}
 */
module.exports = async function ({env, logger, helpers}) {
    const {
        //siteArchiveImportText,
        //siteArchiveExportText,
        siteArchiveExportJSON,
        //siteArchiveImportJSON
    } = helpers;


    var archive = await siteArchiveExportJSON(env, {
        global_data: {
            meta_data: true,
            webdav_client_permissions: true
        }
    });
    let clientIds = archive.get("webdav/client_permissions.json").clients.map(c => c.client_id);
    archive.delete("webdav/client_permissions.json");
    logger.info(`Client IDs in Webdav Config: ${clientIds}`);


};
