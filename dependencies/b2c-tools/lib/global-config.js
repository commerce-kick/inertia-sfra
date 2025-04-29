const path = require("path");
/**
 * Internal global configuration
 * This should be limited to "aspect" type configuration available in library form as well as CLI
 * to avoid drilling parameters into subcommands/methods
 *
 * @namespace GlobalConfig
 */
const CONFIG = {
    ENVIRONMENT: {},
    MIGRATIONS_DIR: path.resolve("migrations"),
    FEATURES_DIR: path.resolve("features"),
    VARS: {}
};

module.exports = CONFIG;
