const logger = require('./logger');
const Environment = require("./environment");
const {
    getInstanceFeatureState,
    boostrapFeatures,
    collectFeatures,
    deployFeature,
    removeFeature
} = require("./features");
const inquirer = require("inquirer");
const {B2C_MIGRATION_HELPERS} = require("./migrations");

async function listFeatures(dir, jsonMode = false) {
    var features = await collectFeatures(dir);
    logger.debug(JSON.stringify(features, null, 2));
    if (jsonMode) {
        console.log(JSON.stringify(features, null, 2))
    } else {
        console.log(features.map(f => f.featureName).join('\n'))
    }
}

async function deployFeatureCommand(featuresDir, name, vars, saveSecrets = true) {
    var env = new Environment();

    if (!name) {
        var features = await collectFeatures(featuresDir)
        var featuresInProject = features.map(f => f.featureName);
        var answers = await inquirer.prompt([{
            name: 'featureName',
            message: 'Which feature to deploy?',
            type: 'list',
            choices: featuresInProject
        }])
        name = answers.featureName;
    }
    await deployFeature(env, name, {featuresDir, vars, saveSecrets})
}

async function updateFeaturesCommand(featuresDir, vars, saveSecrets = true) {
    var env = new Environment();
    var features = await collectFeatures(featuresDir);

    for (let feature of features) {
        if (typeof feature.beforeDeploy === 'function') {
            await feature.beforeDeploy({
                env,
                logger,
                helpers: B2C_MIGRATION_HELPERS,
                vars
            })
        }
    }

    var instanceState = await getInstanceFeatureState(env);
    if (instanceState === null) {
        logger.warn('No features installed on this instance; skipping feature updates...')
        return;
    }

    var featureNames = features.map(f => f.featureName);
    var featuresToUpdate = instanceState.features.filter(f => featureNames.includes(f.featureName)).map(f => f.featureName);

    if (featuresToUpdate.length === 0) {
        logger.warn('No common features installed on this instance');
        return;
    }

    logger.info(`Updating features...`)

    for (var featureName of featuresToUpdate) {
        await deployFeature(env, featureName, {featuresDir, vars, saveSecrets})
    }
}

async function removeFeatureCommand(featuresDir, featureName, vars) {
    var env = new Environment();

    if (!featureName) {
        var instanceState = await getInstanceFeatureState(env);

        if (instanceState === null || instanceState.features.length === 0) {
            logger.warn('No features installed on this instance...')
            return;
        }

        var featuresOnInstance = instanceState.features.map(f => f.featureName);
        var answers = await inquirer.prompt([{
            name: 'featureName',
            message: 'Which feature to remove?',
            type: 'list',
            choices: featuresOnInstance
        }])
        featureName = answers.featureName;
    }

    await removeFeature(env, featureName, {featuresDir, vars})
}

/**
 * @typedef {Object} FeatureFeatureState
 * @property {string} featureName
 * @property {string} path
 */

module.exports = {
    command: 'feature',
    desc: 'feature management',
    builder: (yargs) => yargs
        .option('features-dir', {
            describe: 'features dir',
            default: './features'
        })
        .group(["features-dir"], "Features:")
        .command('list', 'list available features',
            async (y) => y.option('json', {
                describe: 'output in json format',
                default: false,
                type: 'boolean'
            }),
            async (argv) => await listFeatures(argv["features-dir"], argv.json)
        )
        .command('bootstrap', 'boostrap instance for feature installation',
            async (y) => y,
            async () => {
                var env = new Environment();
                await boostrapFeatures(env)
            }
        )
        .command('current', 'list current features on instance',
            async (y) =>
                y.option('--available', {
                    describe: 'only list available features',
                    default: false,
                    type: 'boolean'
                }).option('json', {
                    describe: 'output in json format',
                    default: false,
                    type: 'boolean'
                }),
            async (argv) => {
                var env = new Environment();
                var features = await collectFeatures(argv["features-dir"])
                var state = await getInstanceFeatureState(env)
                /* @type {FeatureFeatureState[]} */
                var instanceFeatures = state.features
                if (state === null) {
                    throw new Error("Cannot access features; bootstrap with 'feature bootstrap' subcommand")
                }
                if (argv.available) {
                    var availableFeatures = features.map(f => f.featureName);
                    instanceFeatures = instanceFeatures.filter(f => availableFeatures.includes(f.featureName))
                    // add path from features to state
                    for (let feature of instanceFeatures) {
                        var featureDef = features.find(f => f.featureName === feature.featureName);
                        if (featureDef) {
                            // @ts-ignore path is not defined on Feature
                            feature.path = featureDef.path;
                        }
                    }
                }
                if (argv.json) {
                    console.log(JSON.stringify(instanceFeatures, null, 2))
                } else {
                    console.log(instanceFeatures.map(f => f.featureName).join('\n'))
                }
            }
        )
        .command('get [feature]', 'get feature state from instance',
            async (y) => y
                .positional('feature', {describe: 'feature name to get'}),
            async (argv) => {
                var env = new Environment();
                var state = await getInstanceFeatureState(env)
                if (argv.feature) {
                    var feature = state.features.find((f) => f.featureName === argv.feature);
                    if (!feature) {
                        throw new Error("Cannot find feature on instance")
                    }
                    console.log(JSON.stringify(feature, null, 2))
                } else {
                    console.log(JSON.stringify(state, null, 2));
                }
            }
        )
        .command('deploy [feature]', 'deploy feature to instance',
            async (y) => y
                .option('save-secrets', {
                    describe: 'save secrets in feature metadata',
                    default: true,
                    type: 'boolean'
                })
                .positional('feature', {describe: 'feature name to deploy'})
                .group(["features-dir", "save-secrets"], "Features:"),
            async (argv) => await deployFeatureCommand(argv["features-dir"], argv.feature, argv.vars, argv["save-secrets"])
        )
        .command('remove [feature]', 'remove a feature from instance',
            async (y) => y
                .positional('feature', {describe: 'feature name to remove'}),
            async (argv) => await removeFeatureCommand(argv["features-dir"], argv.feature, argv.vars)
        )
        .command('update', 'deploy all features installed on instance',
            async (y) => y
                .group(["features-dir", "save-secrets"], "Features:")
                .option('save-secrets', {
                    describe: 'save secrets in feature metadata',
                    default: true,
                    type: 'boolean'
                }),
            async (argv) => await updateFeaturesCommand(argv["features-dir"], argv.vars, argv["save-secrets"])
        )
        .demandCommand()
};
