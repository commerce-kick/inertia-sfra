/**
 * Make a site online/protected via impex respecting existing configuration
 *
 * $ SITE_ID=RefArch STATUS=protected PASSWORD=testing b2c-tools import run change-site-status.js
 * $ SITE_ID=RefArch STATUS=online b2c-tools import run change-site-status.js
 *
 * @param {MigrationScriptArguments} options
 * @return {Promise<void>}
 */
module.exports = async function ({env, logger, helpers}) {
    const SITE_ID = process.env.SITE_ID
    const STATUS = process.env.STATUS

    const {
        siteArchiveExportJSON,
        siteArchiveImportJSON
    } = helpers

    logger.info(`Changing ${SITE_ID} to ${STATUS}`)
    var archive = await siteArchiveExportJSON(env, {
        sites: {
            [SITE_ID]: {
                site_descriptor: true
            }
        }
    })

    var descriptor = archive.get(`sites/${SITE_ID}/site.xml`)
    descriptor.site["storefront-status"] = [STATUS]

    await siteArchiveImportJSON(env, archive)
};
