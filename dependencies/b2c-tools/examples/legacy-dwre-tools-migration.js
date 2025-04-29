/**
 * Converts legacy dwre-tools migrations/hotfixes to b2c-tools
 *
 * prevents reimport of imported legacy migrations without removing them from repo
 * and provides a migration path between tooling
 *
 * this script should be used on-demand or in an onBootstrap lifecycle method
 * to ensure legacy migrations are applied
 *
 * @param {MigrationScriptArguments} options
 * @return {Promise<void>}
 */
module.exports = async function ({env, logger, helpers}) {
    const {siteArchiveExportJSON} = helpers;

    // using impex to avoid ocapi permissions check
    const archive = await siteArchiveExportJSON(env, {
        global_data: {
            preferences: true
        }
    });

    var migrations = [];
    var resp = await env.ocapi.get(`/global_preferences/preference_groups/b2cToolkit/development`);
    if (resp.data.c_b2cToolkitMigrations && resp.data.c_b2cToolkitMigrations.length > 0) {
        migrations = migrations.concat(resp.data.c_b2cToolkitMigrations.split(','));
    }

    logger.info("Checking for legacy migrations...");

    var prefXml = archive.get("preferences.xml");
    delete prefXml.preferences['standard-preferences'];
    delete prefXml.preferences['custom-preferences'][0]["all-instances"];
    delete prefXml.preferences['custom-preferences'][0]["production"];

    var developmentPrefs = prefXml.preferences['custom-preferences'][0]['development'][0];
    var stagingPrefs = prefXml.preferences['custom-preferences'][0]['staging'][0];

    var legacyMigrations = [];
    if (developmentPrefs.preference && developmentPrefs.preference.length > 0) {
        developmentPrefs.preference.filter(p => p['$']['preference-id'] === "dwreMigrateHotfixes")
            .forEach(p => legacyMigrations.push.apply(legacyMigrations, p['_'].split(',')))
        developmentPrefs.preference.filter(p => p['$']['preference-id'] === "dwreMigrateVersionPath")
            .forEach(p => legacyMigrations.push.apply(legacyMigrations, p['_'].split(',')))
    }
    if (stagingPrefs.preference && stagingPrefs.preference.length > 0) {
        stagingPrefs.preference.filter(p => p['$']['preference-id'] === "dwreMigrateHotfixes")
            .forEach(p => legacyMigrations.push.apply(legacyMigrations, p['_'].split(',')))
        stagingPrefs.preference.filter(p => p['$']['preference-id'] === "dwreMigrateVersionPath")
            .forEach(p => legacyMigrations.push.apply(legacyMigrations, p['_'].split(',')))
    }

    if (legacyMigrations.length > 0) {
        let newLegacyMigrations = legacyMigrations.filter(m => !migrations.includes(m))
        if (newLegacyMigrations.length) {
            migrations = newLegacyMigrations.concat(migrations);
            logger.info(`Adding legacy migrations: ${newLegacyMigrations.join(',')}`)

            await env.ocapi.patch(`/global_preferences/preference_groups/b2cToolkit/development`, {
                c_b2cToolkitMigrations: migrations.join(',')
            });
        }
    } else  {
        logger.info('No legacy migrations to apply')
    }
}
