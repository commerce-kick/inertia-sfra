/**
 * CLI smoke tests
 */

const yargs = require("yargs");
let parser;
beforeEach(() => {
    parser = yargs.command(require('../../lib/command-code')).help();
})

describe(('command code deploy command'), () => {
    test('returns valid deploy options', async () => {
        const output = await new Promise((resolve, reject) => {
            parser.parse("code deploy --help", (err, argv, output) => {
                if (err) reject(err);
                resolve(output);
            })
        });

        expect(output).toEqual(expect.stringContaining("--deploy-script"));
    })
})

