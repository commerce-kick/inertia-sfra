/**
 * CLI smoke tests
 */

const yargs = require("yargs");

const {cli} = require('../../lib/config');
const path = require("path");

test('cli parses', async () => {
    var parser = cli.help();

    const output = await new Promise((resolve, reject) => {
        parser.parse("--help", (err, argv, output) => {
            if (err) reject(err);
            resolve(output);
        })
    });
    // expect a default output
    expect(output).toEqual(expect.stringContaining("B2C Connection"));
})

test('instance debug with alternate config', async () => {
    var parser = cli.command(require('../../lib/command-instance')).help();
    var configPath = path.join(__dirname, '../fixtures/dw.json');

    const instanceName = await new Promise((resolve, reject) => {
        parser.parse(`--config ${configPath} -i second-config instance debug`, (err, argv, output) => {
            if (err) reject(err);
            resolve(argv.instance);
        })
    });
    // expect a default output
    expect(instanceName).toEqual(expect.stringContaining("second-config"));
})
