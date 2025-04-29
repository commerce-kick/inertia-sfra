/**
 * CLI smoke tests
 */

const yargs = require("yargs");

let parser;

beforeEach(() => {
    parser = yargs.command(require('../../lib/command-import')).help();
})

describe(('command import run'), () => {
    test('returns valid run positional', async () => {
        const output = await new Promise((resolve, reject) => {
            parser.parse("import run --help", (err, argv, output) => {
                if (err) reject(err);
                resolve(output);
            })
        });

        expect(output).toEqual(expect.stringContaining("target"));
    })
})

describe(('command import migrate'), () => {
    test('returns valid migrate options', async () => {
        const output = await new Promise((resolve, reject) => {
            parser.parse("import migrate --help", (err, argv, output) => {
                if (err) reject(err);
                resolve(output);
            })
        });

        expect(output).toEqual(expect.stringContaining("--migrations-dir"));
    })
})
