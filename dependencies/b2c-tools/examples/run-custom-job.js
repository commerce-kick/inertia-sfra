/**
 * Run and wait for arbitrary jobs
 *
 * @param {MigrationScriptArguments} options
 * @return {Promise<void>}
 */
module.exports = async function ({env, logger, helpers}) {
    const jobId = "ToolkitBrandPostDeploy"

    logger.info(`Executing job ${jobId}`)
    let {id} = await helpers.executeJob(env, jobId, [{
        name: 'SiteScope',
        value: JSON.stringify({"named_sites": ["RefArch"]})
    }])
    logger.info(`Not Waiting for job execution ${id}`)

    let {id: id2} = await helpers.executeJob(env, jobId, [{
        name: 'SiteScope',
        value: JSON.stringify({"named_sites": ["RefArch"]})
    }])
    logger.info(`Waiting for job execution ${id2}`)
    await helpers.waitForJob(env, jobId, id2)
}
