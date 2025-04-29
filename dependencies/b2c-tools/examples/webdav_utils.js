/**
 * Utilizing webdav helpers
 *
 * @param {MigrationScriptArguments} options
 * @return {Promise<void>}
 */
const path = require("path");

module.exports = async function ({env, logger, helpers}) {
    const {uploadArchive, uploadArchiveText} = helpers;

    logger.info('uploading directory contents and extracting');
    await uploadArchive(env, path.join(__dirname, 'data/archive'), 'Impex/src/import/testing')

    logger.info('uploading zip file extracting');
    await uploadArchive(env, path.join(__dirname, 'data/data.zip'), 'Impex/src/import/testing2')

    logger.info('uploading file');
    await uploadArchive(env, path.join(__dirname, 'data/archive/foo.xml'), 'Impex/src/import/testing3')

    logger.info('uploading in-memory archive, extracting but keeping archive')
    await uploadArchiveText(env, new Map([
        ['baz.xml', '<baz></baz>'],
        ['bar.xml', '<bar></bar>']
    ]), 'Impex/src/import/testing4', {
        keepArchive: true
    })

    logger.info('uploading in-memory archive, not extracting')
    await uploadArchiveText(env, new Map([
        ['baz.xml', '<baz></baz>'],
        ['bar.xml', '<bar></bar>']
    ]), 'Impex/src/import/testing4', {
        extract: false
    })

};
