#!/usr/bin/env node
/**
 * b2c-tools CLI Entry Point
 */

// support .env files
require('dotenv').config({override: true})

const logger = require('./lib/logger');
const {commands} = require('./lib/index');
const {cli} = require('./lib/config');
// provided for webpack library export
module.exports = require('./lib/index');

function run() {
    cli
        .epilogue('For more information, read our manual at https://github.com/SalesforceCommerceCloud/b2c-tools')
        .command(commands)
        .fail(function (msg, err, yargs) {
            if (err) {
                logger.error(err.message);
                logger.debug(err.stack);
            } else {
                console.error(yargs.help());
                console.error();
                console.error(msg);
            }
            process.exit(1);
        })
        .demandCommand()
        .strictCommands()
        .help()
        .parse()
}

// when bundled by webpack we check to see if we're running as a cli or library
if (process.env.BUNDLED) {
    if (require.main.filename === __filename) {
        run()
    }
} else {
    run()
}

