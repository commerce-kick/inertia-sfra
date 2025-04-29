#  Features

*features* are an approach for packaging common functionality that can be *optionally* deployed to a B2C
instance. They wrap up cartridges, their own set of [migrations](./MIGRATIONS.md), and a definition file
that describes the necessary configuration to deploy (or remove) the functionality (based on the [vars](./MIGRATIONS.md#vars) concept)

See [./examples/features](../examples/features/) for a contrived working feature.

When features are deployed to a B2C instance this is recorded in a global custom object (`B2CToolsFeature`) with a key value of the features name. Inside this custom object is stored the current state of the [vars](./MIGRATIONS.md#vars). By storing the vars used to configure the feature the values can be reused in feature updates, inspected (`b2c-tools feature get`) and manually updated if necessary.

In addition to storing the vars state a feature can define *secrets* which are keys that will be automatically masked and stored in a password field in the custom object. The tool will automatically manage the masking and unmasking of vars. Finally features (through their migrations) can inspect, update, add or remove vars at runtime providing, for instance, dynamic values such as the current instance's sites.

## Creating Features

Features are stored in a features directory (default: `./features`; change with `--features-dir`). Each directory
inside `./features` is considered a feature if it contains `feature.js` definition file. This file defines the name/identifier for the feature as well as how it is configured. This structure should be it's default export:

```js
module.exports = {
    // the name and identifier for this feature
    featureName: 'My Feature',

    // default vars that will not be queried
    defaultVars: {
    },

    // secret vars will be masked when storing on the instance (note: only top level vars keys are masked)
    secretsVars: [
        'slasClientSecret'
    ],

    beforeDeploy: async function({env, logger, helpers, vars}) {
        // called before a feature is (potentially) deployed
        // can be used to setup defaults, configure environment scopes, etc
        // Note: vars will not contain any feature specific vars at this point as
        // this occurs before the questions step or any network calls
        // This may be invoked multiple times.
    },
    
    // questions are defined as a list (or function returning a promise of a list) of "inquirer"
    // questions. The current vars state will be provided as the default set of answers
    // so features can be deployed both interactively and in non-interactive contexts (CI/CD, etc)
    questions: [
        {
            'name': 'slasClientID',
            'message': 'Client ID?'
        },
        {
            'name': 'slasClientSecret',
            'message': 'Client Secret?'
        }
    ],
    // or as a function with the same signature as a migration script
    questions: async function({env, logger, helpers, vars}, instanceState) {
        var sites = await env.ocapi.get('sites?select=(**)')
        var siteIds = sites.data.data.map(s => s.id);

        return [
            {
                name: 'siteID',
                message: 'Which site?',
                type: 'list',
                choices: siteIds
            },
            {
                'name': 'slasClientID',
                'message': 'Client ID?'
            },
            {
                'name': 'slasClientSecret',
                'message': 'Client Secret?'
            }
        ]
    },

    // identical to the `--exclude-migrations` from `import migrate` but applied to the features migrations directory
    excludeMigrations: [
        '^_.*'
    ],

    // identical to the `--exclude-cartridges` option (that option is ignored for features to give full control here)
    excludeCartridges: [
        'plugin_ignoreme'
    ],
    
    // called when a feature has completed migrations and deploying code
    // any further cleanup, setup, code reloading or job execution can be done here
    finish: async function({env, logger, helpers, vars}, instanceState) {
        delete vars.someVarThatShouldNotBeSaved
    },
    
    // called when a feature is requested to be removed; same signature as a migration script
    remove: async function({env, logger, helpers, vars}, instanceState) {
    }
}
```

When creating features most of the work will be done by migrations in the `migrations/` directory of the feature. This works identically to normal [migrations](./MIGRATIONS.md) but your migration scripts and `setup.js` can rely on having vars available as defined by the feature definition.

Finally any cartridges provided in the feature's `cartridges/` directory (optional) will be synced to the defined code version (or the current code version if not defined).
