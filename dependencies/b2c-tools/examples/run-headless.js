#!/usr/bin/env node
/*
 * Example of using b2c-tools for argument parsing and no command running
 *
 * Useful to take advantage of the configuraation loading (dw.json, env vars, dotenv, package.json, etc) and
 * multi-instance management in custom code
 *
 *
 * (see also examples/run-current-file.js)
 */

//const {Environment, parseConfig} = require("@SalesforceCommerceCloud/b2c-tools");
const {Environment, parseConfig} = require("../lib");

async function run() {
    var argv = parseConfig()
    console.log(argv.server)

    // new environments will be configured with parsed configuration
    var env = new Environment()
    console.log(env.server)
    console.log((await env.ocapi.get('code_versions')).data)
}

run()
