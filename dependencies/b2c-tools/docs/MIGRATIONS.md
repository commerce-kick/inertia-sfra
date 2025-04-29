# B2C Migrations Rationale

## Objective

The B2C site import/export (impex) system of SFCC B2C commerce instances allows for the import and export of nearly all
configuration and data relevant to a commerce storefront. Development of storefronts requires
multiple collaborators: most notably developers, designers and architects. One significant problem is how to coordinate,
review, and sync changes made by these collaborators.

Often there is no procedure over if, when, or how a site impex archive is applied to an instance. This can cause a number of problems:

- Collaborators may upload code changes to their instance (sandbox) without the necessary metadata to support it.
- A project may have no standard for distributing metadata changes and if they do it may not support all uses cases required for the software development lifecycle (i.e. CI/CD)
- Tracking data changes to an instance can be difficult and redundant data changes may overwrite manual changes or produce hard to track defects.
- The standard impex form is static in that it allows for no runtime configuration. Project, instance, and runtime specific configuration is not considered with a static impex.

`b2c-tools` migrations attempts to solve these problems by providing a `import migrate` command that will apply
data migrations to a target instance.

- Data migrations can include static impex folders or migration "scripts" (NodeJS scripts).
- The data migration system is self-bootstrapping as long as the minimum Data API and WebDAV permissions are present
  - A freshly started On-demand sandbox contains all the necessary permissions assuming the same client ID is used
- Migrations will only be applied to an instance 1 time (i.e. `import migrate` is intended to be idempotent)
- Migration scripts can be used to provide runtime and dynamic configuration using the `b2c-tools` API and any other libraries a project may want to us.
    - Migration scripts can also be executed using the `import run` subcommand entirely outside of the migrations concept to make use of the b2c-tools API and CLI configuration loader and reduce boilerplate for b2c scripting.
- Lifecycle functions can be used to control and observe various steps in the migration process and to extend the migration functionality on a per-project basis
  - Custom `onBootstrap` lifecycle methods can be used to provide additional setup (i.e. permissions) per project

## Usage

See [../README.md](../README.md#migrations) Migrations section

### Migration Scripts

See [../examples](../examples) for examples of migration scripts.

#### Vars

b2c-tools provides the ability to pass arbitrary data in the form of *vars*. Vars are an arbitrary JSON structure. Migration scripts
and migration lifecycle functions (below) can make use of this data to provide extra configuration outside of the normal
information provided by the tool.

Vars can be sourced from the environment, configuration files (`package.json`, `dw.json`, `.env`, custom JSON files), via the CLI
and via lifecyle functions (see `init` below). When using environment variables to provide vars use double underscore to define the structure.

Vars are a core argument to b2c-tools so they are available to ALL commands including custom commands when [extending](./EXTENDING.md) the tool.

Use the `instance debug` command to print out all arguments (including vars) that the tool has been configured with.

```shell
$ b2c-tools --vars '{"foo": "bar"}' instance debug
$ b2c-tools --vars-file vars.json instance debug
$ SFCC_VARS__TEST__TESTING=foo SFCC_VARS__TEST2__TESTING=foo2 b2c-tools --vars '{"foo": "bar"}' instance debug
# vars: {"foo": "bar", "test": {"testing":"foo"}, "test2": {"testing":"foo2"} }
```

### Lifecycle functions

If a `setup.js` script is found in the migrations directory and contains a default export containing an object of functions
these will be called during various lifecycle stages.

These methods are asynchronous.

See [API.md#MigrationLifecycleFunctions](API.md#MigrationLifecycleFunctions) for API details

**Example**

```javascript
module.exports = {
    /**
     * Called before any other operation. Used for custom setup of environment
     * and providing custom vars at runtime
     *
     * @param {object} args
     * @param {import('@SalesforceCommerceCloud/b2c-tools').Environment} args.env
     * @param {import('@SalesforceCommerceCloud/b2c-tools').logger} args.logger
     * @param {import('@SalesforceCommerceCloud/b2c-tools').B2C_MIGRATION_HELPERS} args.helpers
     * @param {object} args.vars
     * @returns {Promise<void>}
     */
    init: async function({env, logger, helpers, vars}) {},
  
    /**
     * Return true to force a boostrap regardless of the current self-boostrap state
     * Use this to bootstrap custom configuration, etc.
     *
     * @param {object} args
     * @param {import('@SalesforceCommerceCloud/b2c-tools').Environment} args.env
     * @param {import('@SalesforceCommerceCloud/b2c-tools').logger} args.logger
     * @param {import('@SalesforceCommerceCloud/b2c-tools').B2C_MIGRATION_HELPERS} args.helpers
     * @param {object} args.vars
     * @param {ToolkitInstanceState} instanceState
     * @returns {Promise<boolean>}
     */
    shouldBootstrap: async function({env, logger, helpers, vars}, instanceState) {},
    
    /**
     * Runs after migration self-bootstrapping, on tool metadata upgrades or when `--force-bootstrap` is
     * specified. Projects can use this to provide additional setup, permissions or custom functionality
     * required by migration scripts or lifecycle methods.
     *
     * @param {object} args
     * @param {import('@SalesforceCommerceCloud/b2c-tools').Environment} args.env
     * @param {import('@SalesforceCommerceCloud/b2c-tools').logger} args.logger
     * @param {import('@SalesforceCommerceCloud/b2c-tools').B2C_MIGRATION_HELPERS} args.helpers
     * @param {object} args.vars
     * @returns {Promise<void>}
     */
    onBootstrap: async function({env, logger, helpers, vars}) {},

    /**
     * Runs before all migrations. The migrationsToRun list can be mutated to change the list
     * of migrations to run
     *
     * @param {MigrationScriptArguments} args
     * @param {string[]} migrationsToRun list of migrations that will be run (mutable)
     * @param {boolean} willApply true if migrations will be applied to the instance
     * @param {object} args.vars
     * @returns {Promise<void>}
     */
    beforeAll: async function({env, logger, helpers, vars}, migrationsToRun, willApply) {},

    /**
     * Runs before each migration; Return false to skip this migration
     *
     * @param {MigrationScriptArguments} args
     * @param {string} migration migration to be run
     * @param {boolean} willApply true if migrations will be applied to the instance
     * @returns {Promise<boolean>} return false to skip the current migration
     */
    beforeEach: async function({env, logger, helpers, vars}, migration, willApply) {},

    /**
     * Runs after each migration
     *
     * @param {MigrationScriptArguments} args
     * @param {string} migration migration to be run
     * @param {boolean} willApply true if migrations will be applied to the instance
     * @returns {Promise<void>}
     */
    afterEach: async function({env, logger, helpers, vars}, migration, willApply) {},

    /**
     * Runs after all migrations
     *
     * @param {MigrationScriptArguments} args
     * @param {string[]} migrationsRan list of migrations ran
     * @param {boolean} willApply true if migrations will be applied to the instance
     * @returns {Promise<void>}
     */
    afterAll: async function({env, logger, helpers, vars}, migrationsRan, willApply) {},

    /**
     * Runs on migration exception. Re-raise the exception or a new Error to stop execution
     * Ignoring the error will continue.
     *
     * @param {MigrationScriptArguments} args
     * @param {string} migration migration to be run
     * @param {Error} e exception raised during migration run
     * @returns {Promise<void>} re-raise exception or new exception to stop migration run
     */
    onFailure: async function({env, logger, helpers, vars}, migration, e) {
        throw e;
    },
}
```
